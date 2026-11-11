import { buildTable } from "@tmcontrolpanel/plugin-sdk";
import { DEFAULT_THEME } from "@tmcontrolpanel/shared";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ActionRouter } from "../../src/core/manialink/action-router";
import { ActionGroup } from "../../src/core/manialink/components/action-group";
import { Manialink } from "../../src/core/manialink/components/manialink";
import { Window } from "../../src/core/manialink/components/window";
import { ManialinkService } from "../../src/core/manialink/manialink-service";
import { TemplateRenderer } from "../../src/core/manialink/template-renderer";
import { loadTemplateSources } from "../../src/infra/templates";
import { flush } from "../fakes/clock";
import { FakeGbxSession } from "../fakes/fake-gbx";
import { testRenderer } from "../fakes/harness";
import { silentLogger } from "../fakes/logger";

const TEMPLATES_DIR = fileURLToPath(
  new URL("../../templates", import.meta.url),
);

function setup() {
  const gbx = new FakeGbxSession();
  const manialinks = new ManialinkService(gbx, silentLogger);
  const actions = new ActionRouter(silentLogger);
  const renderer = new TemplateRenderer({
    widget: '<manialink id="{{id}}"/>',
    "widget-update": '<manialink id="{{id}}">{{{data.mapJson}}}</manialink>',
    window: '<manialink id="{{id}}"/>',
    ...loadTemplateSources(TEMPLATES_DIR),
  });
  return { gbx, manialinks, actions, deps: { renderer, manialinks, actions } };
}

describe("TemplateRenderer", () => {
  it("renders layouts, partials and helpers", () => {
    const renderer = new TemplateRenderer({
      base: '<root id="{{id}}">{{#block "body"}}{{/block}}</root>',
      part: "<p>{{ add 1 2 }}</p>",
      page: '{{#extend "base"}}{{#content "body"}}{{> part}}{{bool flag}}{{/content}}{{/extend}}',
    });
    expect(renderer.render("page", { id: "x", flag: true })).toBe(
      '<root id="x"><p>3</p>True</root>',
    );
  });

  it("passes the theme to every template", () => {
    const page =
      '<q bg="{{ @theme.quad.background }}" fg="{{ @theme.label.foreground }}"/>';
    expect(new TemplateRenderer({ page }).render("page", {})).toBe(
      '<q bg="222" fg="DDD"/>',
    );
    const loop =
      "{{#each items}}{{ @theme.quad.foregroundMuted }}{{ @theme.label.foregroundMuted }}{{/each}}";
    expect(
      new TemplateRenderer({ loop }).render("loop", { items: [1, 2] }),
    ).toBe("CCCCCCCCCCCC");
    const light = {
      quad: { ...DEFAULT_THEME.quad, background: "EEE" },
      label: { ...DEFAULT_THEME.label, foreground: "111" },
    };
    expect(new TemplateRenderer({ page }, light).render("page", {})).toBe(
      '<q bg="EEE" fg="111"/>',
    );
  });

  it("throws on unknown templates", () => {
    expect(() => new TemplateRenderer({}).render("nope", {})).toThrow(
      /Unknown manialink template/,
    );
  });

  // Snapshots guard the output of every shipped template against accidental changes
  it.each(testRenderer().names())("renders %s", (name) => {
    const xml = testRenderer().render(name, {
      id: "test-id",
      position: { x: 1, y: 2 },
      size: { x: 50, y: 40 },
      title: "Title",
      hideWhileDriving: true,
      // components/table reads these hash params from its context
      table: buildTable({
        columns: [
          { title: "Name", width: 30, key: "name" },
          {
            title: "Score",
            width: 10,
            align: "right",
            key: "score",
            color: (row) => (row.score > 5 ? "F60" : null),
          },
        ],
        rows: [
          { name: "One", score: 3 },
          { name: "Two", score: 9 },
          { name: "Three", score: 1 },
        ],
        page: 1,
        pageSize: 2,
      }),
      prev: "prev",
      next: "next",
      data: {
        actions: [{ name: "a", icon: "x", action: "act", type: "image" }],
        positionsAvailable: [1, 2],
        currentAction: { action: "pick", nickName: "Nick" },
      },
    });
    expect(xml).toMatchSnapshot();
  });
});

describe("ManialinkService", () => {
  it("hides then shows a public page and remembers it", () => {
    const { gbx, manialinks } = setup();
    manialinks.display("w", '<manialink id="w">x</manialink>');

    expect(gbx.sent.map((s) => s.method)).toEqual([
      "SendDisplayManialinkPage",
      "SendDisplayManialinkPage",
    ]);
    expect(manialinks.displayedIds()).toEqual(["w"]);
  });

  it("re-displays public and personal pages to a reconnecting player", async () => {
    const { gbx, manialinks } = setup();
    manialinks.display("public", '<manialink id="public"/>');
    manialinks.display("mine", '<manialink id="mine"/>', "abc");
    manialinks.display("theirs", '<manialink id="theirs"/>', "other");

    await manialinks.onPlayerConnect("abc");
    const calls = gbx.multicalls.at(-1)!;
    expect(calls.map((c) => c[2])).toEqual([
      '<manialink id="public"/>',
      '<manialink id="mine"/>',
    ]);
  });

  it("forgets personal pages of disconnected players", () => {
    const { manialinks } = setup();
    manialinks.display("mine", "<x/>", "abc");
    manialinks.onPlayerDisconnect("abc");
    expect(manialinks.displayedIds("abc")).toEqual([]);
  });

  it("resendAll actually sends every page", async () => {
    const { gbx, manialinks } = setup();
    manialinks.display("a", "<a/>");
    manialinks.display("b", "<b/>", "abc");
    await manialinks.resendAll();
    expect(gbx.multicalls.at(-1)).toHaveLength(2);
  });

  it("destroy removes the page from the remembered set", () => {
    const { manialinks } = setup();
    manialinks.display("a", "<a/>");
    manialinks.destroy("a");
    expect(manialinks.displayedIds()).toEqual([]);
  });
});

describe("components", () => {
  it("pairs a widget with its update page", () => {
    const { gbx, deps } = setup();
    const widget = new Manialink(deps, {
      id: "map-info-widget",
      template: "widget",
    });
    widget.setData({ mapJson: JSON.stringify({ name: "A", author: "B" }) });
    widget.display();

    expect(gbx.sentManialinkIds()).toEqual([
      "map-info-widget",
      "map-info-widget",
      "map-info-widget-update",
      "map-info-widget-update",
    ]);

    gbx.sent.length = 0;
    widget.update();
    expect(gbx.sentManialinkIds().at(-1)).toBe("map-info-widget-update");
    expect(String(gbx.sent.at(-1)!.params[0])).toContain('"name":"A"');
  });

  it("closes only the window of the player that clicked close", async () => {
    const { deps, actions } = setup();
    const closed: string[] = [];
    const make = (login: string) =>
      new Window(deps, {
        id: "ecm-window",
        template: "window",
        login,
        title: "ECM",
        onClose: () => closed.push(login),
      });
    make("a");
    make("b");

    await actions.dispatch({
      PlayerUid: 1,
      Login: "a",
      Answer: "close-window-ecm-window",
      Entries: [],
    });
    await flush();
    expect(closed).toEqual(["a"]);
  });

  it("action group hides itself when the last action is removed", () => {
    const { gbx, deps, manialinks } = setup();
    const group = new ActionGroup(deps);
    group.add({ name: "ecm", icon: "x" });
    expect(manialinks.displayedIds()).toEqual(["action-group-widget"]);

    group.remove("ecm");
    expect(group.list()).toEqual([]);
    expect(manialinks.displayedIds()).toEqual([]);
  });

  it("shows admin-only actions only on connected admins' personal pages", () => {
    const { gbx, deps, manialinks } = setup();
    const group = new ActionGroup(deps);
    group.add({ name: "public", icon: "p" });
    group.setAdmins(["admin"]);
    expect(manialinks.displayedIds()).toEqual(["action-group-widget"]);
    group.add({ name: "private", icon: "a", adminOnly: true });
    const publicXml = gbx.sent
      .filter((s) => s.method === "SendDisplayManialinkPage")
      .map((s) => String(s.params[0]))
      .find((xml) => xml.includes("<script"));
    const personalXml = gbx.sent
      .filter((s) => s.method === "SendDisplayManialinkPageToLogin")
      .map((s) => String(s.params[1]))
      .find((xml) => xml.includes("<script"));
    expect(String(publicXml)).toContain('text="p"');
    expect(String(publicXml)).not.toContain('text="a"');
    expect(String(personalXml)).toContain('text="a"');
    expect(manialinks.displayedIds()).toEqual(["action-group-widget"]);
    expect(manialinks.displayedIds("admin")).toEqual(["action-group-widget"]);
    expect(manialinks.displayedIds("other")).toEqual([]);
    group.setAdmins([]);
    expect(manialinks.displayedIds("admin")).toEqual([]);
    group.remove("private");
    group.setAdmins(["admin"]);
    expect(manialinks.displayedIds("admin")).toEqual([]);
  });

  it("does not rerender when admins change without admin-only actions", () => {
    const { gbx, deps } = setup();
    const group = new ActionGroup(deps);
    group.add({ name: "public", icon: "p" });
    gbx.sent.length = 0;
    group.setAdmins(["admin"]);
    expect(gbx.sent).toHaveLength(0);
  });
});
