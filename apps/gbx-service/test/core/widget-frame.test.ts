import { WidgetFrame } from "@tmcontrolpanel/plugin-sdk/ui";
import { render } from "maniatsx";
import { jsx } from "maniatsx/jsx-runtime";
import { describe, expect, it } from "vitest";

const page = (hideWhileDriving: boolean) =>
  render(
    jsx(WidgetFrame, {
      id: "w",
      position: { x: 100, y: 85 },
      hideWhileDriving,
    }),
  );

describe("WidgetFrame", () => {
  it("places a hidden frame at the position and reveals it from the script", () => {
    const xml = page(false);
    expect(xml).toMatch(/<frame id="widget"[^>]*pos="100 85"[^>]*hidden="1"/);
    expect(xml).toContain("widget.Show();");
    expect(xml).not.toMatch(/while \(True\) \{[^}]*hidescript\(\);/);
  });

  it("adds the per-frame hide call only when hideWhileDriving is set", () => {
    expect(page(true)).toMatch(/while \(True\) \{[\s\S]*hidescript\(\);/);
  });
});
