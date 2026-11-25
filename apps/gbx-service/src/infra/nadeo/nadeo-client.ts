import { AppError } from "../../core/errors";
import type { Logger } from "../../core/logger";
import type {
  LeaderboardEntry,
  MapMetadata,
  MapMetadataProvider,
  NadeoRecordsProvider,
} from "../../core/ports";
import type { KeyValueCache } from "../redis/cache";

const PROD_URL = "https://prod.trackmania.core.nadeo.online";
const API_URL = "https://api.trackmania.com/api";
const LIVE_URL = "https://live-services.trackmania.nadeo.live";

// Shared with the web app so both processes reuse the same tokens and name cache
const tokenKey = (audience: Audience) => `nadeo:tokens:${audience}`;
const CREDENTIALS_TOKEN_KEY = "nadeo:credentials_token";
const ACCOUNT_NAMES_KEY = "nadeo:account-names";
const mapIdKey = (mapUid: string) => `nadeo:map-id:${mapUid}`;
const MAP_ID_TTL_SECONDS = 60 * 60 * 24;

const ACCOUNT_ID = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const MAX_BATCH_ACCOUNTS = 100;
const DEFAULT_BATCH_MS = 200;

type Audience = "NadeoServices" | "NadeoLiveServices";

export interface NadeoConfig {
  serverLogin: string;
  serverPassword: string;
  contact: string;
  clientId: string;
  clientSecret: string;
}

export interface NadeoClientDeps {
  config: NadeoConfig;
  cache: KeyValueCache;
  // Wraps every outgoing API request; the Redis token bucket in production
  rateLimit: <T>(key: string, fn: () => Promise<T>) => Promise<T>;
  log: Logger;
  fetch?: typeof fetch;
  // How long personal best lookups of one map are collected into one request
  batchMs?: number;
}

interface PersonalBestBatch {
  accountIds: Set<string>;
  bests: Promise<Map<string, number>>;
}

interface NadeoTokens {
  accessToken: string;
  refreshToken: string;
}

interface NadeoMapInfo {
  mapId: string;
  mapUid: string;
  submitter: string;
  timestamp: string;
  fileUrl: string;
  thumbnailUrl: string;
}

interface LeaderboardResponse {
  tops: { top: { accountId: string; score: number }[] }[];
}

interface MapRecordResponse {
  accountId: string;
  recordScore: { time: number };
}

// The subset of the Nadeo / Trackmania APIs the GBX service needs
export class NadeoClient implements MapMetadataProvider, NadeoRecordsProvider {
  private readonly fetch: typeof fetch;
  private readonly inFlight = new Map<string, Promise<unknown>>();
  // Batches that still accept accounts, by map uid
  private readonly openBatches = new Map<string, PersonalBestBatch>();

  constructor(private readonly deps: NadeoClientDeps) {
    this.fetch = deps.fetch ?? globalThis.fetch;
  }

  async getMapsMetadata(uids: string[]): Promise<Map<string, MapMetadata>> {
    const infos = await this.getMapInfos(uids);
    return new Map(
      infos.map((info) => [
        info.mapUid,
        {
          submitter: info.submitter,
          timestamp: new Date(info.timestamp),
          fileUrl: info.fileUrl,
          thumbnailUrl: info.thumbnailUrl,
        },
      ]),
    );
  }

  async getWorldRecord(mapUid: string): Promise<LeaderboardEntry | null> {
    const url = `${LIVE_URL}/api/token/leaderboard/group/Personal_Best/map/${mapUid}/top?length=1&offset=0&onlyWorld=true`;
    const response = await this.dedupe(`worldRecord:${mapUid}`, () =>
      this.request<LeaderboardResponse>(url, "NadeoLiveServices"),
    );
    const top = response.tops?.[0]?.top?.[0];
    return top ? { accountId: top.accountId, score: top.score } : null;
  }

  async getPersonalBests(
    mapUid: string,
    accountIds: string[],
  ): Promise<Map<string, number>> {
    if (accountIds.length === 0) return new Map();

    // A malformed id fails the whole request, so it may not share one with other callers
    if (!accountIds.every((id) => ACCOUNT_ID.test(id))) {
      return this.fetchPersonalBests(mapUid, () => accountIds);
    }

    const bests = await this.joinBatch(mapUid, accountIds).bests;
    return new Map(
      accountIds.flatMap((id) => {
        const time = bests.get(id);
        return time === undefined ? [] : [[id, time] as const];
      }),
    );
  }

  // Plugins and servers on the same map look players up at the same moments
  private joinBatch(mapUid: string, accountIds: string[]): PersonalBestBatch {
    const open = this.openBatches.get(mapUid);
    if (open) {
      const merged = new Set([...open.accountIds, ...accountIds]);
      if (merged.size <= MAX_BATCH_ACCOUNTS) {
        for (const id of accountIds) open.accountIds.add(id);
        return open;
      }
    }

    const ids = new Set(accountIds);
    const close = () => {
      if (this.openBatches.get(mapUid) === batch)
        this.openBatches.delete(mapUid);
    };
    const run = async () => {
      try {
        await new Promise((resolve) =>
          setTimeout(resolve, this.deps.batchMs ?? DEFAULT_BATCH_MS),
        );
        // Stays open while the request waits for the rate limiter
        return await this.fetchPersonalBests(mapUid, () => {
          close();
          return [...ids];
        });
      } finally {
        close();
      }
    };
    const batch: PersonalBestBatch = { accountIds: ids, bests: run() };
    this.openBatches.set(mapUid, batch);
    return batch;
  }

  private async fetchPersonalBests(
    mapUid: string,
    accountIds: () => string[],
  ): Promise<Map<string, number>> {
    const mapId = await this.getMapId(mapUid);
    if (!mapId) return new Map();

    const records = await this.request<MapRecordResponse[]>(
      () =>
        `${PROD_URL}/v2/mapRecords/by-account?accountIdList=${accountIds().join(",")}&mapId=${mapId}`,
      "NadeoServices",
    );
    return new Map(
      records.map((record) => [record.accountId, record.recordScore.time]),
    );
  }

  private async getMapId(mapUid: string): Promise<string | null> {
    const cached = await this.deps.cache.get(mapIdKey(mapUid));
    if (cached) return cached;

    const [info] = await this.dedupe(`mapId:${mapUid}`, () =>
      this.getMapInfos([mapUid]),
    );
    if (!info) return null;
    await this.deps.cache.set(mapIdKey(mapUid), info.mapId, MAP_ID_TTL_SECONDS);
    return info.mapId;
  }

  async getAccountNames(accountIds: string[]): Promise<Record<string, string>> {
    const cached: Record<string, string> = JSON.parse(
      (await this.deps.cache.get(ACCOUNT_NAMES_KEY)) ?? "{}",
    );

    const result: Record<string, string> = {};
    const missing: string[] = [];
    for (const id of new Set(accountIds)) {
      if (cached[id]) result[id] = cached[id];
      else missing.push(id);
    }
    if (missing.length === 0) return result;

    for (let i = 0; i < missing.length; i += 50) {
      const params = new URLSearchParams();
      missing
        .slice(i, i + 50)
        .forEach((id) => params.append("accountId[]", id));
      const names = await this.credentialsRequest<Record<string, string>>(
        `${API_URL}/display-names?${params}`,
      );
      Object.assign(result, names);
      Object.assign(cached, names);
    }

    await this.deps.cache.set(
      ACCOUNT_NAMES_KEY,
      JSON.stringify(cached),
      60 * 60 * 24,
    );
    return result;
  }

  private async getMapInfos(uids: string[]): Promise<NadeoMapInfo[]> {
    if (uids.length === 0) return [];
    return this.request<NadeoMapInfo[]>(
      `${PROD_URL}/maps/?mapUidList=${uids.join(",")}`,
      "NadeoServices",
    );
  }

  // A url function is called once the rate limiter lets the request through
  private request<T>(
    url: string | (() => string),
    audience: Audience,
  ): Promise<T> {
    return this.deps.rateLimit("nadeo:doRequest", () =>
      this.authorizedRequest<T>(
        typeof url === "string" ? url : url(),
        async (refresh) =>
          `nadeo_v1 t=${await this.servicesToken(audience, refresh)}`,
      ),
    );
  }

  private credentialsRequest<T>(url: string): Promise<T> {
    return this.deps.rateLimit("nadeo:doCredentialsRequest", () =>
      this.authorizedRequest<T>(
        url,
        async (refresh) => `Bearer ${await this.credentialsToken(refresh)}`,
      ),
    );
  }

  // Retries once with a fresh token on 401
  private async authorizedRequest<T>(
    url: string,
    authorization: (refresh: boolean) => Promise<string>,
  ): Promise<T> {
    const send = async (refresh: boolean) =>
      this.fetch(url, {
        headers: {
          Authorization: await authorization(refresh),
          "User-Agent": this.deps.config.contact,
        },
      });

    let response = await send(false);
    if (response.status === 401) response = await send(true);

    if (!response.ok) {
      this.deps.log.error(
        { url, status: response.status },
        "Nadeo request failed",
      );
      throw new AppError(
        "UpstreamError",
        `Nadeo request failed: ${response.status} ${response.statusText}`,
      );
    }
    return (await response.json()) as T;
  }

  private async servicesToken(
    audience: Audience,
    refresh: boolean,
  ): Promise<string> {
    if (!refresh) {
      const cached = await this.deps.cache.get(tokenKey(audience));
      if (cached) return (JSON.parse(cached) as NadeoTokens).accessToken;
    }
    return this.dedupe(`services:${audience}`, () =>
      this.authenticateServices(audience),
    );
  }

  private async credentialsToken(refresh: boolean): Promise<string> {
    if (!refresh) {
      const cached = await this.deps.cache.get(CREDENTIALS_TOKEN_KEY);
      if (cached) return cached;
    }
    return this.dedupe("credentials", () => this.authenticateCredentials());
  }

  private dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const pending = this.inFlight.get(key);
    if (pending) return pending as Promise<T>;

    const promise = fn().finally(() => this.inFlight.delete(key));
    this.inFlight.set(key, promise);
    return promise;
  }

  private async authenticateServices(audience: Audience): Promise<string> {
    const { serverLogin, serverPassword, contact } = this.deps.config;
    const response = await this.fetch(
      `${PROD_URL}/v2/authentication/token/basic`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${serverLogin}:${serverPassword}`).toString("base64")}`,
          "Content-Type": "application/json",
          "User-Agent": contact,
        },
        body: JSON.stringify({ audience }),
      },
    );

    if (!response.ok) {
      throw new AppError(
        "UpstreamError",
        `Nadeo authentication failed: ${response.status}`,
      );
    }

    const tokens = (await response.json()) as NadeoTokens;
    await this.deps.cache.set(tokenKey(audience), JSON.stringify(tokens), 3600);
    return tokens.accessToken;
  }

  private async authenticateCredentials(): Promise<string> {
    const { clientId, clientSecret } = this.deps.config;
    if (!clientId || !clientSecret) {
      throw new AppError(
        "BadRequest",
        "NADEO_CLIENT_ID and NADEO_CLIENT_SECRET are required",
      );
    }

    const response = await this.fetch(`${API_URL}/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      throw new AppError(
        "UpstreamError",
        `Trackmania API authentication failed: ${response.status}`,
      );
    }

    const credentials = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };
    await this.deps.cache.set(
      CREDENTIALS_TOKEN_KEY,
      credentials.access_token,
      credentials.expires_in,
    );
    return credentials.access_token;
  }
}
