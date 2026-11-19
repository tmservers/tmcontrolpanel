import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  layoutMessages,
  updateScript,
} from "../../src/core/chat/codriver-window";
import { TemplateRenderer } from "../../src/core/manialink/template-renderer";
import { ActionGroupPage } from "../../src/core/manialink/tsx/action-group";
import {
  CodriverWindowPage,
  CodriverWindowUpdatePage,
  type CodriverWindowData,
} from "../../src/core/manialink/tsx/codriver-window";
import { renderComponent } from "../../src/core/manialink/tsx/render";
import type { ManialinkPageProps } from "../../src/core/manialink/tsx/types";
import { loadTemplateSources } from "../../src/infra/templates";
import { ProbePage, ProbeWidget, ProbeWindow } from "../helpers/probe-pages";
import { normalizeXml, scriptDiff } from "../helpers/xml-normalize";

const dir = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// The shipped templates plus the Handlebars versions of the pages that are now components
const renderer = new TemplateRenderer({
  ...loadTemplateSources(dir("../../templates")),
  ...loadTemplateSources(dir("../fixtures/legacy-templates")),
});

// Pages that extend the core layouts the way plugins do
const probes = new TemplateRenderer({
  "probe-page":
    '{{#extend "manialink"}}{{#content "content"}}<frame id="body" pos="1 2" size="3 4" />{{/content}}{{/extend}}',
  "probe-window":
    '{{#extend "window"}}{{#content "window"}}<label id="body" pos="2 -2" text="Hello" textsize="1" />{{/content}}' +
    '{{#content "events"}}if (event.Control.ControlId == "body") { Hit = True; }{{/content}}{{/extend}}',
  "probe-widget":
    '{{#extend "widget"}}{{#content "widget"}}<quad size="10 10" />{{/content}}{{/extend}}',
  ...loadTemplateSources(dir("../../templates")),
});

const props = (
  overrides: Partial<ManialinkPageProps> = {},
): ManialinkPageProps => ({
  id: "test-id",
  position: { x: -156, y: 85 },
  size: { x: 100, y: 60 },
  title: "Title",
  hideWhileDriving: false,
  data: undefined,
  ...overrides,
});

interface Expected {
  // Script statements only the TSX page has, or only the Handlebars one
  onlyTsx?: string[];
  onlyHbs?: string[];
  // The legacy `color=` of a label is `textcolor=` in the TSX pages (v3 labels have no `color`)
  labelColor?: boolean;
}

// The game ignored the legacy close icon's `color`, so the TSX page gives it the title's color
function closeIconLikeTitle(hbs: string): string {
  const title =
    /<label [^>]*color="(\w+)"[^>]*textfont="GameFontSemiBold"/.exec(hbs)?.[1];
  if (!title) return hbs;
  return hbs.replace(
    /(<label [^>]*?)color="\w+"([^>]*action="close-window-)/,
    `$1color="${title}"$2`,
  );
}

// Renders both versions with the Default theme and compares structure, attribute values and script statements
function expectEquivalent(hbs: string, tsx: string, expected: Expected = {}) {
  if (expected.labelColor) hbs = closeIconLikeTitle(hbs);
  const a = normalizeXml(hbs, {
    renameAttrs: expected.labelColor ? { label: { color: "textcolor" } } : {},
  });
  const b = normalizeXml(tsx);
  expect(b.tree).toEqual(a.tree);
  const diff = scriptDiff(b.script, a.script);
  expect(diff.onlyA).toEqual(expected.onlyTsx ?? []);
  expect(diff.onlyB).toEqual(expected.onlyHbs ?? []);
}

describe("normalizeXml", () => {
  it("ignores attribute order, whitespace and number formatting", () => {
    const a = normalizeXml(
      '<manialink id="x"><quad pos="1.0 -2" size="3 4"  /></manialink>',
    );
    const b = normalizeXml(
      '<?xml version="1.0"?>\n<manialink id="x">\n  <quad size="3.0000 4" pos="1 -2.00"/>\n</manialink>',
    );
    expect(b).toEqual(a);
  });

  it("notices a different attribute value", () => {
    const a = normalizeXml('<manialink id="x"><quad pos="1 2" /></manialink>');
    const b = normalizeXml('<manialink id="x"><quad pos="1 3" /></manialink>');
    expect(b.tree).not.toEqual(a.tree);
  });

  it("compares script statements regardless of order and block layout", () => {
    const a = normalizeXml(
      '<manialink id="x"><script><!-- a();\nif(event.Control == Null){ b(); } --></script></manialink>',
    );
    const b = normalizeXml(
      '<manialink id="x"><script><!--\nif (Event.Control == Null) {\n  b();\n}\n--></script><script><!-- a(); --></script></manialink>',
    );
    expect(b.script).toEqual(a.script);
  });
});

describe("TSX pages match their Handlebars versions (Default theme)", () => {
  it("Page matches manialink.hbs", () => {
    const hbs = probes.render("probe-page", props());
    const tsx = renderComponent(ProbePage, props());
    expectEquivalent(hbs, tsx);
  });

  // Intended differences: the title bar labels say textcolor, the Handlebars page says color
  it("Window matches window.hbs", () => {
    const hbs = probes.render("probe-window", props());
    const tsx = renderComponent(ProbeWindow, props());
    expectEquivalent(hbs, tsx, { labelColor: true });
  });

  it.each([false, true])(
    "Widget matches widget.hbs (hideWhileDriving %s)",
    (hide) => {
      const hbs = probes.render(
        "probe-widget",
        props({ hideWhileDriving: hide }),
      );
      const tsx = renderComponent(
        ProbeWidget,
        props({ hideWhileDriving: hide }),
      );
      expectEquivalent(hbs, tsx);
    },
  );

  // Intended difference: widget.hbs lets action-group.hbs fill `{{#content main}}` (unquoted, so it never
  // rendered); the TSX page declares the persisted open state in main(), which is what that block meant
  it.each([
    ["no buttons", []],
    [
      "image and text buttons",
      [
        {
          name: "a",
          icon: "https://x.test/a.png",
          type: "image",
          action: "act-a",
        },
        { name: "b", icon: "\uf0c9", type: "text", action: "act-b" },
        { name: "c", icon: "C", action: "act-c" },
      ],
    ],
  ])("ActionGroup matches action-group.hbs (%s)", (_, actions) => {
    const page = props({
      id: "action-group-widget",
      hideWhileDriving: true,
      data: { actions },
    });
    expectEquivalent(
      renderer.render("action-group", page),
      renderComponent(ActionGroupPage, page),
      { onlyTsx: ["declare Boolean actionGroupIsOpen for This = False;"] },
    );
  });

  // Intended differences: the title bar labels say textcolor, not color; the TSX script is one block
  describe("Codriver window", () => {
    const width = 106;
    const messages = layoutMessages(
      [
        { speaker: "You", text: "status" },
        {
          speaker: "Codriver",
          text: "Everything looks fine, the map has 3 minutes left. $fffStay tuned",
        },
      ],
      width,
    );
    const data: CodriverWindowData = {
      width,
      inputY: -58,
      inputHeight: 10,
      draftY: -51,
      speakers: 30,
      lines: 120,
      bubbles: 30,
      script: updateScript({
        version: 3,
        clearEntry: 1,
        scrollEnd: 2,
        messages: messages.shown,
        logHeight: 40.5,
        contentHeight: messages.height,
        empty: false,
        busy: true,
        progress: "Codriver is thinking…",
        progressY: -41.5,
        confirm: true,
        confirmY: -51,
        draft: "Draft (5/200): hello",
      }),
    };
    const page = (id: string) =>
      props({
        id,
        size: { x: 110, y: 72 },
        title: "Codriver (experimental)",
        data,
      });

    it("window matches codriver-window.hbs", () => {
      expectEquivalent(
        renderer.render("codriver-window", page("codriver-window")),
        renderComponent(CodriverWindowPage, page("codriver-window")),
        { labelColor: true },
      );
    });

    it("update page matches codriver-window-update.hbs", () => {
      expectEquivalent(
        renderer.render(
          "codriver-window-update",
          page("codriver-window-update"),
        ),
        renderComponent(
          CodriverWindowUpdatePage,
          page("codriver-window-update"),
        ),
        // maniatsx always ends a page script with the event loop; the Handlebars one ended after main().
        // The loop only yields, and the shared variables outlive the script either way
        { onlyTsx: ["while(True) {", "yield;", "}"] },
      );
    });
  });
});
