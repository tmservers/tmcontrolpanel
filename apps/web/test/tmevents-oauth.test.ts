import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const config = vi.hoisted(() => ({
  TMEVENTS: {
    CLIENT_ID: "client",
    CLIENT_SECRET: "secret",
    REDIRECT_URI: "https://panel.test/callback",
  },
  SECRETS_KEY: "s".repeat(40),
}));
const redis = vi.hoisted(() => {
  const values = new Map<string, string>();
  return {
    values,
    getRedisClient: vi.fn(async () => ({
      get: vi.fn(async (key: string) => values.get(key) ?? null),
      set: vi.fn(
        async (key: string, value: string, _mode: string, _ttl: number) => {
          values.set(key, value);
        },
      ),
      del: vi.fn(async (key: string) => {
        values.delete(key);
      }),
    })),
  };
});
vi.mock("server-only", () => ({}));
vi.mock("@/lib/config", () => ({ default: config }));
vi.mock("@/lib/redis", () => ({ getRedisClient: redis.getRedisClient }));

import {
  connectTmevents,
  createAuthorization,
  disconnectTmevents,
  tmeventsConfigured,
  tmeventsGet,
} from "@/lib/tmevents/oauth";

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const tokenReply = (
  access_token: string,
  refresh_token = "refresh",
  expires_in = 3600,
) => ({ access_token, refresh_token, expires_in });
const storedKey = "tmevents:tokens:user";
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  config.TMEVENTS = {
    CLIENT_ID: "client",
    CLIENT_SECRET: "secret",
    REDIRECT_URI: "https://panel.test/callback",
  };
  config.SECRETS_KEY = "s".repeat(40);
  redis.values.clear();
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

describe("Trackmania Events OAuth", () => {
  it("requires all credentials and a sufficiently long secrets key", () => {
    expect(tmeventsConfigured()).toBe(true);
    for (const key of ["CLIENT_ID", "CLIENT_SECRET", "REDIRECT_URI"] as const) {
      const previous = config.TMEVENTS[key];
      config.TMEVENTS[key] = "";
      expect(tmeventsConfigured()).toBe(false);
      config.TMEVENTS[key] = previous;
    }
    config.SECRETS_KEY = "short";
    expect(tmeventsConfigured()).toBe(false);
  });

  it("builds a PKCE authorization URL with fresh state and verifier", () => {
    const first = createAuthorization();
    const second = createAuthorization();
    const url = new URL(first.url);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe("client");
    expect(url.searchParams.get("redirect_uri")).toBe(
      config.TMEVENTS.REDIRECT_URI,
    );
    expect(url.searchParams.get("scope")).toBe("events:read offline_access");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toBe(
      createHash(first.verifier),
    );
    expect(first.state).not.toBe(first.verifier);
    expect(first.state).not.toBe(second.state);
    expect(first.verifier).not.toBe(second.verifier);
  });

  it("exchanges an authorization code with client_secret_post and stores encrypted tokens", async () => {
    fetchMock.mockResolvedValueOnce(response(tokenReply("access-secret")));
    await connectTmevents("user", "code", "verifier");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://trackmania.events/auth/oauth2/token");
    expect(init.method).toBe("POST");
    expect(new URLSearchParams(String(init.body)).get("grant_type")).toBe(
      "authorization_code",
    );
    expect(new URLSearchParams(String(init.body)).get("code_verifier")).toBe(
      "verifier",
    );
    const body = new URLSearchParams(String(init.body));
    expect(body.get("client_id")).toBe("client");
    expect(body.get("client_secret")).toBe("secret");
    expect(new Headers(init.headers).get("authorization")).toBeNull();
    expect(redis.values.get(storedKey)).toBeTruthy();
    expect(redis.values.get(storedKey)).not.toContain("access-secret");
  });

  it("sends bearer authorization and rejects missing tokens", async () => {
    await expect(tmeventsGet("user", "/events")).rejects.toMatchObject({
      name: "TmeventsNotConnected",
    });
    await seedTokens(tokenReply("access"));
    fetchMock.mockResolvedValueOnce(response({ ok: true }));
    await expect(tmeventsGet("user", "/events")).resolves.toEqual({ ok: true });
    expect(
      new Headers(
        (fetchMock.mock.calls[0] as [string, RequestInit])[1].headers,
      ).get("authorization"),
    ).toBe("Bearer access");
  });

  it("refreshes expired tokens before the request and persists the rotated refresh token", async () => {
    await seedTokens(tokenReply("old", "old-refresh", 0));
    fetchMock
      .mockResolvedValueOnce(response(tokenReply("new", "rotated")))
      .mockResolvedValueOnce(response({ ok: true }));
    await tmeventsGet("user", "/events");
    expect(
      new URLSearchParams(
        String((fetchMock.mock.calls[0] as [string, RequestInit])[1].body),
      ).get("refresh_token"),
    ).toBe("old-refresh");
    expect(
      new Headers(
        (fetchMock.mock.calls[1] as [string, RequestInit])[1].headers,
      ).get("authorization"),
    ).toBe("Bearer new");
    expect(await decryptStored()).toMatchObject({
      accessToken: "new",
      refreshToken: "rotated",
    });
  });

  it("refreshes once after a 401 and forgets tokens when refresh fails", async () => {
    await seedTokens(tokenReply("old"));
    fetchMock
      .mockResolvedValueOnce(response({}, 401))
      .mockResolvedValueOnce(response(tokenReply("new", "rotated")))
      .mockResolvedValueOnce(response({ ok: true }));
    await tmeventsGet("user", "/events");
    expect(fetchMock).toHaveBeenCalledTimes(3);

    redis.values.clear();
    await seedTokens(tokenReply("expired", "refresh", 0));
    fetchMock.mockResolvedValueOnce(response({ error: "invalid_grant" }, 400));
    await expect(tmeventsGet("user", "/events")).rejects.toMatchObject({
      name: "TmeventsNotConnected",
    });
    expect(redis.values.has(storedKey)).toBe(false);
  });

  it("shares one refresh request between concurrent calls", async () => {
    await seedTokens(tokenReply("old", "refresh", 0));
    let finish!: (value: Response) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    fetchMock.mockImplementation(async () => response({ ok: true }));
    const first = tmeventsGet("user", "/one");
    const second = tmeventsGet("user", "/two");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    finish(response(tokenReply("fresh", "rotated")));
    await Promise.all([first, second]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("surfaces API error messages and disconnects with revocation", async () => {
    await seedTokens(tokenReply("access", "refresh"));
    fetchMock.mockResolvedValueOnce(
      response({ error: "bad", message: "Event unavailable" }, 400),
    );
    await expect(tmeventsGet("user", "/events")).rejects.toMatchObject({
      name: "TmeventsError",
      message: expect.stringContaining("Event unavailable"),
    });
    fetchMock.mockResolvedValueOnce(response({ revoked: true }));
    await disconnectTmevents("user");
    expect(redis.values.has(storedKey)).toBe(false);
    const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
    expect(url).toBe("https://trackmania.events/auth/oauth2/revoke");
    expect(new URLSearchParams(String(init.body)).get("token")).toBe("refresh");
  });
});

function createHash(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}
async function seedTokens(tokens: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) {
  const { encryptSecret } = await import("@/lib/secrets");
  redis.values.set(
    storedKey,
    encryptSecret(
      JSON.stringify({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
      }),
    ),
  );
}
async function decryptStored() {
  const { decryptSecret } = await import("@/lib/secrets");
  return JSON.parse(decryptSecret(redis.values.get(storedKey)!));
}
