import { describe, expect, it } from "vitest";
import { GAME_MODE_SCRIPTS } from "../src";

describe("game mode scripts", () => {
  it("contains twelve unique files", () => {
    expect(GAME_MODE_SCRIPTS).toHaveLength(12);
    expect(new Set(GAME_MODE_SCRIPTS.map((script) => script.file)).size).toBe(
      12,
    );
  });
});
