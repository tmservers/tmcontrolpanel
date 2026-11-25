import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config";

const base = {
  DATABASE_URL: "postgresql://localhost/db",
  REDIS_URI: "redis://localhost:6379",
  GBX_SERVICE_TOKEN: "t".repeat(32),
  WS_TICKET_SECRET: "s".repeat(32),
};

describe("loadConfig", () => {
  it("applies defaults and splits lists", () => {
    const config = loadConfig({
      ...base,
      WS_ALLOWED_ORIGINS: "http://a, http://b",
      GBX_SERVICE_ENABLED_SERVERS: "",
    });
    expect(config.PORT).toBe(3100);
    expect(config.WS_ALLOWED_ORIGINS).toEqual(["http://a", "http://b"]);
    expect(config.GBX_SERVICE_ENABLED_SERVERS).toEqual([]);
    expect(config.templatesDir).toMatch(/gbx-service\/templates$/);
  });

  it("lists every problem at once", () => {
    expect(() => loadConfig({ GBX_SERVICE_TOKEN: "short" })).toThrow(
      /DATABASE_URL[\s\S]*REDIS_URI[\s\S]*GBX_SERVICE_TOKEN must be at least 32[\s\S]*WS_TICKET_SECRET/,
    );
  });

  it("keeps event archiving off by default", () => {
    const config = loadConfig(base);
    expect(config.EVENT_ARCHIVE_ENDPOINT).toBe("");
    expect(config.EVENT_ARCHIVE_SKIP_REPLIES).toBe(false);
  });

  it("rejects partial archive credentials and accepts all four", () => {
    expect(() =>
      loadConfig({ ...base, EVENT_ARCHIVE_BUCKET: "events" }),
    ).toThrow(/EVENT_ARCHIVE_ENDPOINT must be set/);
    expect(() =>
      loadConfig({
        ...base,
        EVENT_ARCHIVE_ENDPOINT: "https://objects.example.com",
        EVENT_ARCHIVE_BUCKET: "events",
        EVENT_ARCHIVE_ACCESS_KEY_ID: "key",
        EVENT_ARCHIVE_SECRET_ACCESS_KEY: "secret",
      }),
    ).not.toThrow();
  });

  it("parses EVENT_ARCHIVE_SKIP_REPLIES", () => {
    expect(
      loadConfig({ ...base, EVENT_ARCHIVE_SKIP_REPLIES: "true" })
        .EVENT_ARCHIVE_SKIP_REPLIES,
    ).toBe(true);
    expect(
      loadConfig({ ...base, EVENT_ARCHIVE_SKIP_REPLIES: "false" })
        .EVENT_ARCHIVE_SKIP_REPLIES,
    ).toBe(false);
  });
});
