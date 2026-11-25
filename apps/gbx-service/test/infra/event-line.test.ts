import { describe, expect, it } from "vitest";
import { encodeEvent, isScriptReply } from "../../src/infra/archive/event-line";

const callback = "ManiaPlanet.ModeScriptCallbackArray";

describe("event lines", () => {
  it("splices script JSON verbatim", () => {
    const payload = '{ "responseid": "abc", "value": 1 }';
    const line = encodeEvent(123, callback, ["Reply", [payload]]);
    expect(line).toBe(`[123,"Reply",${payload}]\n`);
    expect(JSON.parse(line)).toEqual([
      123,
      "Reply",
      { responseid: "abc", value: 1 },
    ]);
  });

  it.each([
    ["newline", ["Event", ['{"value":\n1}']]],
    ["plain text", ["Event", ["hello"]]],
    ["empty string", ["Event", [""]]],
    ["several args", ["Event", ['{"a":1}', "extra"]]],
  ])("falls back safely for %s", (_name, data) => {
    const line = encodeEvent(123, callback, data);
    expect(line.endsWith("\n")).toBe(true);
    expect(JSON.parse(line)[0]).toBe(123);
  });

  it("encodes ordinary callbacks and undefined data", () => {
    expect(JSON.parse(encodeEvent(1, "Method", { a: true }))).toEqual([
      1,
      "Method",
      { a: true },
    ]);
    expect(JSON.parse(encodeEvent(1, "Method", undefined))).toEqual([
      1,
      "Method",
      null,
    ]);
  });

  it("recognizes only script replies", () => {
    expect(isScriptReply(callback, ["Reply", ['{"responseid":"x"}']])).toBe(
      true,
    );
    expect(isScriptReply(callback, ["Event", ['{"responseid":""}']])).toBe(
      false,
    );
    expect(isScriptReply(callback, ["Reply", ["not json"]])).toBe(false);
    expect(isScriptReply("Other", ["Reply", ['{"responseid":"x"}']])).toBe(
      false,
    );
  });
});
