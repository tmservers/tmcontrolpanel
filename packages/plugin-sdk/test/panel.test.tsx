/** @jsxRuntime automatic */
/** @jsxImportSource maniatsx */
import { resolvePreset } from "@tmcontrolpanel/shared";
import { Manialink } from "maniatsx";
import { describe, expect, it } from "vitest";
import { renderComponent, type ManialinkPageProps } from "../src/render";
import { Panel, type PanelProps } from "../src/ui/panel";

const pageProps: ManialinkPageProps = {
  id: "panel-test",
  position: { x: 0, y: 0 },
  size: { x: 100, y: 50 },
  title: "Panel test",
  hideWhileDriving: false,
  data: null,
};

function renderPanel(props: PanelProps, preset = "default") {
  function Page() {
    return (
      <Manialink id="panel-test">
        <Panel {...props} />
      </Manialink>
    );
  }

  // Broadcast ships square corners; give it a radius to cover the rounded path
  const theme = resolvePreset(preset);
  if (preset === "broadcast") theme.tokens.shape.radius = 1;
  return renderComponent(Page, pageProps, theme);
}

const base = { tone: "surface" as const, size: [20, 10] as [number, number] };

describe("Panel", () => {
  it("renders one opaque quad with the default preset", () => {
    const markup = renderPanel(base);
    expect(markup.match(/<quad\b/g)).toHaveLength(1);
    expect(markup).toContain('bgcolor="222"');
    expect(markup).not.toContain("opacity=");
  });

  it("rounds broadcast corners with QuarterCircle brush quads", () => {
    const all = renderPanel(base, "broadcast");
    expect(all).toContain("<frame");
    expect(all.match(/01-EllipseRound\/Brush\.tga/g)).toHaveLength(4);

    const left = renderPanel({ ...base, corners: "left" }, "broadcast");
    expect(left.match(/01-EllipseRound\/Brush\.tga/g)).toHaveLength(2);
  });

  it.each([
    ["id", { id: "panel" }],
    ["class", { class: "panel" }],
    ["scriptevents", { scriptevents: true }],
  ] as const)("falls back to one quad when %s is set", (_key, extra) => {
    const markup = renderPanel({ ...base, ...extra }, "broadcast");
    expect(markup.match(/<quad\b/g)).toHaveLength(1);
    expect(markup).not.toContain("<frame");
  });

  it("uses opacity for content and surface tones", () => {
    expect(renderPanel({ ...base, tone: "content" }, "broadcast")).toContain(
      'opacity="0.72"',
    );
    expect(renderPanel(base, "broadcast")).toContain('opacity="0.86"');
  });

  it("adds a full-size action overlay", () => {
    const markup = renderPanel({ ...base, action: "panel:click" }, "broadcast");
    expect(markup).toContain('action="panel:click"');
    expect(markup).toContain('opacity="0"');
  });

  it("lets explicit opacity override the theme", () => {
    expect(
      renderPanel({ ...base, opacity: 0.4 }, "broadcast").match(
        /opacity="0\.4"/g,
      ),
    ).not.toBeNull();
  });
});
