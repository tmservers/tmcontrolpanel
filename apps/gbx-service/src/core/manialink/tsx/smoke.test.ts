import { describe, expect, it } from "vitest";
import { renderTsxSmoke } from "./smoke";

describe("maniatsx smoke", () => {
  it("renders a themed label into a manialink", () => {
    const xml = renderTsxSmoke();
    expect(xml).toContain('<manialink id="tsx-smoke"');
    expect(xml).toContain('text="Hello from TSX"');
    expect(xml).toContain('textcolor="FFF"');
  });
});
