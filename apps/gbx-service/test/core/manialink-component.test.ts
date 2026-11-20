import { resolvePreset } from "@tmcontrolpanel/shared";
import { describe, expect, it } from "vitest";
import { ActionRouter } from "../../src/core/manialink/action-router";
import { ActionGroup } from "../../src/core/manialink/components/action-group";
import {
  Manialink,
  type ManialinkDeps,
} from "../../src/core/manialink/components/manialink";
import { ManialinkService } from "../../src/core/manialink/manialink-service";
import { TemplateRenderer } from "../../src/core/manialink/template-renderer";
import { FakeGbxSession } from "../fakes/fake-gbx";
import { silentLogger } from "../fakes/logger";
import { ProbePage, ProbeWidget } from "../helpers/probe-pages";

function setup(themeData?: ManialinkDeps["themeData"]) {
  const gbx = new FakeGbxSession();
  const manialinks = new ManialinkService(gbx, silentLogger);
  const deps: ManialinkDeps = {
    renderer: new TemplateRenderer({}),
    manialinks,
    actions: new ActionRouter(silentLogger),
    themeData,
  };
  return { gbx, manialinks, deps };
}

const lightTheme = () => {
  const base = resolvePreset("default");
  return {
    ...base,
    tokens: { ...base.tokens, color: { ...base.tokens.color, surface: "ABC" } },
  };
};

describe("Manialink with a component", () => {
  it("renders the component under the server's preset", () => {
    const { deps } = setup(lightTheme);
    const page = new Manialink(deps, {
      id: "probe",
      component: ProbeWidget,
      withUpdate: false,
      position: { x: 5, y: 6 },
    });
    const xml = page.render();
    expect(xml).toContain('id="probe"');
    expect(xml).toContain('pos="5 6"');
  });

  it("themes the action group from the preset tokens", () => {
    const { deps, gbx } = setup(lightTheme);
    const group = new ActionGroup(deps);
    group.add({ name: "a", icon: "x", action: "act" });
    const sent = gbx.sent.map((call) => String(call.params[0])).join("\n");
    expect(sent).toContain('bgcolor="ABC"');
    expect(sent).toContain('action="act"');
  });

  it("falls back to the Default preset without themeData", () => {
    const { deps, gbx } = setup();
    new ActionGroup(deps).add({ name: "a", icon: "x", action: "act" });
    const sent = gbx.sent.map((call) => String(call.params[0])).join("\n");
    expect(sent).toContain('bgcolor="222"');
  });

  it("pairs a component with an update component only when given one", () => {
    const { deps, gbx } = setup();
    new Manialink(deps, { id: "solo", component: ProbePage }).display();
    expect(
      gbx.sent.some((call) =>
        String(call.params[0]).includes('id="solo-update"'),
      ),
    ).toBe(false);

    new Manialink(deps, {
      id: "paired",
      component: ProbePage,
      updateComponent: ProbePage,
    }).display();
    expect(
      gbx.sent.some((call) =>
        String(call.params[0]).includes('id="paired-update"'),
      ),
    ).toBe(true);
  });

  it("needs a template or a component", () => {
    const { deps } = setup();
    expect(() => new Manialink(deps, { id: "none" })).toThrow(
      /template or a component/,
    );
  });
});
