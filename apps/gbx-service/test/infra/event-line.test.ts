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

  it("flattens the server's pretty-printed script JSON onto one line", () => {
    const payload =
      '{\n\t"count": 1,\r\n\t"map": {\n\t\t"name": "Training - 18"\n\t}\n}';
    const line = encodeEvent(5, callback, [
      "Maniaplanet.StartMap_Start",
      [payload],
    ]);
    expect(line).toBe(
      '[5,"Maniaplanet.StartMap_Start",{"count": 1,"map": {"name": "Training - 18"}}]\n',
    );
    expect(JSON.parse(line)[2]).toEqual(JSON.parse(payload));
    expect(
      isScriptReply(callback, ["Reply", ['{\n\t"responseid": "tmcp"\n}']]),
    ).toBe(true);
  });

  it.each([
    ["newline inside a string", ["Event", ['{"value":"a\nb"}']]],
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
