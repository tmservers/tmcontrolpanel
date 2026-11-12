import config from "@/lib/config";
import { getRedisClient } from "@/lib/redis";
import { canStoreSecrets, decryptSecret, encryptSecret } from "@/lib/secrets";
import { ServerError } from "@/types/responses";
import crypto from "node:crypto";
import "server-only";

// Trackmania Events: OAuth 2.1 authorization code with PKCE. Every panel user links
// their own account; the tokens stay on the server, encrypted in Redis.

const ISSUER = "https://trackmania.events/auth";
const AUTHORIZE_URL = `${ISSUER}/oauth2/authorize`;
const TOKEN_URL = `${ISSUER}/oauth2/token`;
const REVOKE_URL = `${ISSUER}/oauth2/revoke`;
const API_URL = "https://api.trackmania.events/v1";
const SCOPES = "events:read offline_access";
const TIMEOUT_MS = 10_000;
// A refresh token that is never used again should not sit in Redis forever
const REFRESH_TTL_SECONDS = 180 * 24 * 60 * 60;

export const TMEVENTS_ISSUER = ISSUER;

interface Tokens {
  accessToken: string;
  refreshToken?: string;
  // Epoch milliseconds
  expiresAt: number;
}

const tokenKey = (userId: string) => `tmevents:tokens:${userId}`;

export function tmeventsConfigured(): boolean {
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = config.TMEVENTS;
  return !!(CLIENT_ID && CLIENT_SECRET && REDIRECT_URI) && canStoreSecrets();
}

function notConnected(): ServerError {
  return new ServerError(
    "Connect your Trackmania Events account first",
    "TmeventsNotConnected",
  );
}

// The URL to send the user to, with the state and PKCE verifier to keep for the callback
export function createAuthorization(): {
  url: string;
  state: string;
  verifier: string;
} {
  const state = crypto.randomBytes(24).toString("base64url");
  const verifier = crypto.randomBytes(48).toString("base64url");
  const url = new URL(AUTHORIZE_URL);
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: config.TMEVENTS.CLIENT_ID,
    redirect_uri: config.TMEVENTS.REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge: crypto
      .createHash("sha256")
      .update(verifier)
      .digest("base64url"),
    code_challenge_method: "S256",
  }).toString();
  return { url: url.toString(), state, verifier };
}

async function requestTokens(params: Record<string, string>): Promise<Tokens> {
  const { CLIENT_ID, CLIENT_SECRET } = config.TMEVENTS;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    // Apps on Trackmania Events are registered for client_secret_post
    body: new URLSearchParams({
      ...params,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || typeof body?.access_token !== "string") {
    throw new ServerError(
      `Trackmania Events refused the sign-in (${body?.error ?? res.status})`,
      "TmeventsTokenError",
    );
  }
  return {
    accessToken: body.access_token,
    refreshToken:
      typeof body.refresh_token === "string" ? body.refresh_token : undefined,
    expiresAt:
      Date.now() +
      (typeof body.expires_in === "number" ? body.expires_in : 300) * 1000,
  };
}

async function saveTokens(userId: string, tokens: Tokens) {
  const ttl = tokens.refreshToken
    ? REFRESH_TTL_SECONDS
    : Math.max(1, Math.ceil((tokens.expiresAt - Date.now()) / 1000));
  const redis = await getRedisClient();
  await redis.set(
    tokenKey(userId),
    encryptSecret(JSON.stringify(tokens)),
    "EX",
    ttl,
  );
}

async function loadTokens(userId: string): Promise<Tokens | null> {
  const redis = await getRedisClient();
  const stored = await redis.get(tokenKey(userId));
  if (!stored) return null;
  try {
    return JSON.parse(decryptSecret(stored));
  } catch {
    // SECRETS_KEY changed: the link is gone, the user connects again
    await redis.del(tokenKey(userId));
    return null;
  }
}

// Finishes the sign-in: trades the code for tokens and stores them for the user
export async function connectTmevents(
  userId: string,
  code: string,
  verifier: string,
) {
  const tokens = await requestTokens({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.TMEVENTS.REDIRECT_URI,
    code_verifier: verifier,
  });
  await saveTokens(userId, tokens);
}

export async function isTmeventsConnected(userId: string): Promise<boolean> {
  return !!(await loadTokens(userId));
}

// Refresh tokens rotate, so parallel requests of one user must share a refresh
const refreshing = new Map<string, Promise<Tokens | null>>();

function refresh(userId: string, tokens: Tokens): Promise<Tokens | null> {
  const running = refreshing.get(userId);
  if (running) return running;
  const next = (async () => {
    try {
      if (!tokens.refreshToken) return null;
      const fresh = await requestTokens({
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
      });
      fresh.refreshToken ??= tokens.refreshToken;
      await saveTokens(userId, fresh);
      return fresh;
    } catch {
      return null;
    } finally {
      refreshing.delete(userId);
    }
  })();
  refreshing.set(userId, next);
  return next;
}

async function forget(userId: string) {
  const redis = await getRedisClient();
  await redis.del(tokenKey(userId));
}

// GET on the Trackmania Events API as the user, refreshing the access token when needed
export async function tmeventsGet<T>(userId: string, path: string): Promise<T> {
  let tokens = await loadTokens(userId);
  if (!tokens) throw notConnected();
  if (tokens.expiresAt - Date.now() < 30_000) {
    tokens = await refresh(userId, tokens);
  }
  const call = (token: string) =>
    fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

  let res = tokens ? await call(tokens.accessToken) : null;
  if (tokens && res?.status === 401) {
    tokens = await refresh(userId, tokens);
    res = tokens ? await call(tokens.accessToken) : null;
  }
  if (!res || res.status === 401) {
    await forget(userId);
    throw notConnected();
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ServerError(
      typeof body?.message === "string"
        ? `Trackmania Events: ${body.message}`
        : `Trackmania Events request failed (${res.status})`,
      "TmeventsError",
    );
  }
  return res.json();
}

// Removes the link and revokes what Trackmania Events still accepts, best effort
export async function disconnectTmevents(userId: string) {
  const tokens = await loadTokens(userId);
  await forget(userId);
  const token = tokens?.refreshToken ?? tokens?.accessToken;
  if (!token) return;
  const { CLIENT_ID, CLIENT_SECRET } = config.TMEVENTS;
  await fetch(REVOKE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      token,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  }).catch(() => undefined);
}
