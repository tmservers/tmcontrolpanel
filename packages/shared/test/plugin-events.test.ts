import { describe, expect, it } from "vitest";
import {
  isPrivateGbxCallback,
  matchesCustomEvent,
  parseCustomEventKey,
  parseGbxEventKey,
} from "../src/plugins/events";

describe("custom plugin events", () => {
  it("parses listener keys", () => {
    expect(parseCustomEventKey("records:newRecord")).toEqual({
      plugin: "records",
      name: "newRecord",
    });
    expect(parseCustomEventKey("records:*")).toEqual({
      plugin: "records",
      name: "*",
    });
    expect(parseCustomEventKey("finish")).toBeNull();
    expect(parseCustomEventKey("Records:x")).toBeNull();
    expect(parseCustomEventKey("records:a b")).toBeNull();
    expect(parseCustomEventKey("records:a:b")).toBeNull();
  });

  it("matches one event or every event of a plugin", () => {
    const event = { plugin: "records", name: "newRecord", payload: null };
    expect(
      matchesCustomEvent({ plugin: "records", name: "newRecord" }, event),
    ).toBe(true);
    expect(matchesCustomEvent({ plugin: "records", name: "*" }, event)).toBe(
      true,
    );
    expect(
      matchesCustomEvent({ plugin: "records", name: "other" }, event),
    ).toBe(false);
    expect(matchesCustomEvent({ plugin: "scorer", name: "*" }, event)).toBe(
      false,
    );
  });
});

describe("raw GBX plugin events", () => {
  it("parses valid callback keys and rejects invalid names", () => {
    expect(parseGbxEventKey("gbx:ManiaPlanet.PlayerCheckpoint")).toBe(
      "ManiaPlanet.PlayerCheckpoint",
    );
    expect(parseGbxEventKey("gbx:*")).toBe("*");
    expect(parseGbxEventKey("gbx:a")).toBe("a");
    expect(parseGbxEventKey("gbx:")).toBeNull();
    expect(parseGbxEventKey("gbx:a b")).toBeNull();
    expect(parseGbxEventKey(`gbx:${"a".repeat(101)}`)).toBeNull();
    expect(parseGbxEventKey("other:callback")).toBeNull();
  });

  it("identifies callbacks with private player data", () => {
    expect(isPrivateGbxCallback("ManiaPlanet.PlayerManialinkPageAnswer")).toBe(
      true,
    );
    expect(isPrivateGbxCallback("ManiaPlanet.TunnelDataReceived")).toBe(true);
    expect(isPrivateGbxCallback("ManiaPlanet.PlayerCheckpoint")).toBe(false);
  });
});
