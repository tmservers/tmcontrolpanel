import { describe, expect, it, vi } from "vitest";
import {
  NadeoClient,
  type NadeoClientDeps,
} from "../../src/infra/nadeo/nadeo-client";
import type { KeyValueCache } from "../../src/infra/redis/cache";
import { silentLogger } from "../fakes/logger";

class MemoryCache implements KeyValueCache {
  readonly values = new Map<string, string>();
  async get(key: string) {
    return this.values.get(key) ?? null;
  }
  async set(key: string, value: string) {
    this.values.set(key, value);
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function setup(
  route: (url: string, init?: RequestInit) => Response,
  options: { batchMs?: number; rateLimit?: NadeoClientDeps["rateLimit"] } = {},
) {
  const cache = new MemoryCache();
  const fetch = vi.fn(
    async (input: string | URL | Request, init?: RequestInit) =>
      route(String(input), init),
  );
  const rateLimit = vi.fn(
    options.rateLimit ?? ((_key: string, fn: () => Promise<unknown>) => fn()),
  );
  const client = new NadeoClient({
    config: {
      serverLogin: "srv",
      serverPassword: "pw",
      contact: "tests",
      clientId: "id",
      clientSecret: "secret",
    },
    cache,
    rateLimit: rateLimit as NadeoClientDeps["rateLimit"],
    log: silentLogger,
    fetch: fetch as unknown as typeof globalThis.fetch,
    batchMs: options.batchMs ?? 0,
  });
  return { client, cache, fetch, rateLimit };
}

const mapInfo = {
  mapId: "map-id",
  mapUid: "uid",
  submitter: "s",
  timestamp: "2024-01-01T00:00:00Z",
  fileUrl: "f",
  thumbnailUrl: "t",
};

describe("NadeoClient", () => {
  it("authenticates once and reuses the cached token", async () => {
    const { client, fetch, cache } = setup((url) => {
      if (url.includes("/authentication/token/basic"))
        return json({ accessToken: "tok", refreshToken: "r" });
      return json([mapInfo]);
    });

    await client.getMapsMetadata(["uid"]);
    await client.getMapsMetadata(["uid"]);

    const authCalls = fetch.mock.calls.filter(([url]) =>
      String(url).includes("authentication"),
    );
    expect(authCalls).toHaveLength(1);
    expect(
      JSON.parse(cache.values.get("nadeo:tokens:NadeoServices")!).accessToken,
    ).toBe("tok");
    const [, init] = fetch.mock.calls.at(-1)!;
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: "nadeo_v1 t=tok",
      "User-Agent": "tests",
    });
  });

  it("re-authenticates and retries once on 401", async () => {
    let tokens = 0;
    const { client, cache } = setup((url, init) => {
      if (url.includes("authentication"))
        return json({ accessToken: `tok${++tokens}`, refreshToken: "r" });
      const auth = (init?.headers as Record<string, string>).Authorization;
      return auth === "nadeo_v1 t=stale" ? json({}, 401) : json([mapInfo]);
    });
    cache.values.set(
      "nadeo:tokens:NadeoServices",
      JSON.stringify({ accessToken: "stale" }),
    );

    const result = await client.getMapsMetadata(["uid"]);
    expect(result.get("uid")?.thumbnailUrl).toBe("t");
    expect(tokens).toBe(1);
  });

  it("maps metadata, world records and personal bests", async () => {
    const { client } = setup((url) => {
      if (url.includes("authentication"))
        return json({ accessToken: "tok", refreshToken: "r" });
      if (url.includes("/leaderboard/"))
        return json({ tops: [{ top: [{ accountId: "wr", score: 1234 }] }] });
      if (url.includes("/mapRecords/")) {
        expect(url).toContain("mapId=map-id");
        return json([{ accountId: "a", recordScore: { time: 999 } }]);
      }
      return json([mapInfo]);
    });

    expect(
      (await client.getMapsMetadata(["uid"])).get("uid")?.timestamp,
    ).toEqual(new Date("2024-01-01T00:00:00Z"));
    expect(await client.getWorldRecord("uid")).toEqual({
      accountId: "wr",
      score: 1234,
    });
    expect(await client.getPersonalBests("uid", ["a"])).toEqual(
      new Map([["a", 999]]),
    );
    expect(await client.getPersonalBests("uid", [])).toEqual(new Map());
  });

  it("returns null when a map has no world record", async () => {
    const { client } = setup((url) =>
      url.includes("authentication")
        ? json({ accessToken: "t", refreshToken: "r" })
        : json({ tops: [{ top: [] }] }),
    );
    expect(await client.getWorldRecord("uid")).toBeNull();
  });

  it("caches account names and only asks for missing ones", async () => {
    const { client, fetch, cache } = setup((url) => {
      if (url.includes("access_token"))
        return json({ access_token: "cred", expires_in: 3600 });
      return json({ b: "Bee" });
    });
    cache.values.set("nadeo:account-names", JSON.stringify({ a: "Ay" }));

    expect(await client.getAccountNames(["a", "b"])).toEqual({
      a: "Ay",
      b: "Bee",
    });
    const nameCall = fetch.mock.calls.find(([url]) =>
      String(url).includes("display-names"),
    )!;
    expect(String(nameCall[0])).toContain("accountId%5B%5D=b");
    expect(String(nameCall[0])).not.toContain("=a");
    expect(JSON.parse(cache.values.get("nadeo:account-names")!)).toEqual({
      a: "Ay",
      b: "Bee",
    });

    fetch.mockClear();
    await client.getAccountNames(["a", "b"]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("deduplicates concurrent authentication", async () => {
    const { client, fetch } = setup((url) =>
      url.includes("authentication")
        ? json({ accessToken: "tok", refreshToken: "r" })
        : json([mapInfo]),
    );
    await Promise.all([
      client.getMapsMetadata(["uid"]),
      client.getMapsMetadata(["uid"]),
    ]);
    expect(
      fetch.mock.calls.filter(([url]) =>
        String(url).includes("authentication"),
      ),
    ).toHaveLength(1);
  });

  it("surfaces upstream failures as typed errors and routes through the rate limiter", async () => {
    const { client, rateLimit } = setup((url) =>
      url.includes("authentication")
        ? json({ accessToken: "tok", refreshToken: "r" })
        : json({}, 500),
    );
    await expect(client.getWorldRecord("uid")).rejects.toMatchObject({
      code: "UpstreamError",
    });
    expect(rateLimit).toHaveBeenCalledWith(
      "nadeo:doRequest",
      expect.any(Function),
    );
  });

  describe("personal best batching", () => {
    const id = (n: number) =>
      `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
    const accountsOf = (url: string) =>
      new URL(url).searchParams
        .get("accountIdList")!
        .split(",")
        .filter(Boolean);
    const recordUrls = (fetch: { mock: { calls: unknown[][] } }) =>
      fetch.mock.calls
        .map(([url]) => String(url))
        .filter((url) => url.includes("/mapRecords/"));
    const mapUrls = (fetch: { mock: { calls: unknown[][] } }) =>
      fetch.mock.calls
        .map(([url]) => String(url))
        .filter((url) => url.includes("/maps/"));

    // Answers every requested account with a time derived from its number
    const route = (url: string) => {
      if (url.includes("authentication"))
        return json({ accessToken: "tok", refreshToken: "r" });
      if (url.includes("/mapRecords/")) {
        return json(
          accountsOf(url).map((accountId) => ({
            accountId,
            recordScore: { time: Number(accountId.slice(-12)) + 1000 },
          })),
        );
      }
      if (url.includes("/leaderboard/"))
        return json({ tops: [{ top: [{ accountId: "wr", score: 1 }] }] });
      return json([mapInfo]);
    };

    it("merges concurrent lookups of one map into one request", async () => {
      const { client, fetch } = setup(route);
      const [a, b] = await Promise.all([
        client.getPersonalBests("uid", [id(1), id(2)]),
        client.getPersonalBests("uid", [id(3)]),
      ]);

      expect(recordUrls(fetch)).toHaveLength(1);
      expect(mapUrls(fetch)).toHaveLength(1);
      expect(a).toEqual(
        new Map([
          [id(1), 1001],
          [id(2), 1002],
        ]),
      );
      expect(b).toEqual(new Map([[id(3), 1003]]));
    });

    it("does not merge different maps", async () => {
      const { client, fetch } = setup(route);
      await Promise.all([
        client.getPersonalBests("uid1", [id(1)]),
        client.getPersonalBests("uid2", [id(2)]),
      ]);
      expect(recordUrls(fetch)).toHaveLength(2);
    });

    it("lets accounts join while the request waits for the rate limiter, not after", async () => {
      let release!: () => void;
      const gate = new Promise<void>((resolve) => (release = resolve));
      let waiting!: () => void;
      const reached = new Promise<void>((resolve) => (waiting = resolve));
      let calls = 0;
      const { client, fetch } = setup(route, {
        rateLimit: async (_key, fn) => {
          // Only the records request is held back
          if (++calls === 2) {
            waiting();
            await gate;
          }
          return fn();
        },
      });

      const first = client.getPersonalBests("uid", [id(1)]);
      await reached;
      const joined = client.getPersonalBests("uid", [id(2)]);
      release();
      const [firstResult, joinedResult] = await Promise.all([first, joined]);

      expect(recordUrls(fetch)).toHaveLength(1);
      expect(accountsOf(recordUrls(fetch)[0])).toEqual([id(1), id(2)]);
      expect(firstResult).toEqual(new Map([[id(1), 1001]]));
      expect(joinedResult).toEqual(new Map([[id(2), 1002]]));

      // The batch has been sent, so a new caller starts a new request
      await client.getPersonalBests("uid", [id(3)]);
      expect(recordUrls(fetch)).toHaveLength(2);
      expect(accountsOf(recordUrls(fetch)[1])).toEqual([id(3)]);
    });

    it("caches the map id", async () => {
      const { client, fetch } = setup(route);
      await client.getPersonalBests("uid", [id(1)]);
      await client.getPersonalBests("uid", [id(2)]);
      expect(mapUrls(fetch)).toHaveLength(1);
      expect(recordUrls(fetch)).toHaveLength(2);
    });

    it("splits more than 100 accounts over two requests", async () => {
      const { client, fetch } = setup(route);
      const results = await Promise.all([
        client.getPersonalBests(
          "uid",
          Array.from({ length: 60 }, (_, i) => id(i)),
        ),
        client.getPersonalBests(
          "uid",
          Array.from({ length: 60 }, (_, i) => id(100 + i)),
        ),
      ]);

      const urls = recordUrls(fetch);
      expect(urls).toHaveLength(2);
      expect(urls.every((url) => accountsOf(url).length <= 100)).toBe(true);
      expect(urls.flatMap(accountsOf)).toHaveLength(120);
      expect(results.map((r) => r.size)).toEqual([60, 60]);
    });

    it("sends a malformed id alone and keeps it from failing a valid caller", async () => {
      const { client, fetch } = setup((url) =>
        url.includes("/mapRecords/") && url.includes("bad")
          ? json({}, 500)
          : route(url),
      );
      const [bad, good] = await Promise.allSettled([
        client.getPersonalBests("uid", ["bad"]),
        client.getPersonalBests("uid", [id(1)]),
      ]);

      expect(bad.status).toBe("rejected");
      expect(good).toMatchObject({
        status: "fulfilled",
        value: new Map([[id(1), 1001]]),
      });
      expect(recordUrls(fetch)).toHaveLength(2);
    });

    it("rejects every caller of a failed batch and recovers afterwards", async () => {
      let fail = true;
      const { client } = setup((url) =>
        url.includes("/mapRecords/") && fail ? json({}, 500) : route(url),
      );
      const results = await Promise.allSettled([
        client.getPersonalBests("uid", [id(1)]),
        client.getPersonalBests("uid", [id(2)]),
      ]);
      expect(results.map((r) => r.status)).toEqual(["rejected", "rejected"]);

      fail = false;
      expect(await client.getPersonalBests("uid", [id(1)])).toEqual(
        new Map([[id(1), 1001]]),
      );
    });

    it("sends one world record request for concurrent callers", async () => {
      const { client, fetch } = setup(route);
      const results = await Promise.all([
        client.getWorldRecord("uid"),
        client.getWorldRecord("uid"),
      ]);
      expect(results).toEqual([
        { accountId: "wr", score: 1 },
        { accountId: "wr", score: 1 },
      ]);
      expect(
        fetch.mock.calls.filter(([url]) =>
          String(url).includes("/leaderboard/"),
        ),
      ).toHaveLength(1);
    });
  });
});
