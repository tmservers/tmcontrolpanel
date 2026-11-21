import { build } from "esbuild";
import { maniatsxEsbuildPlugin } from "maniatsx/esbuild-plugin";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let pages: { listPage: string; customPage: string };
const dir = mkdtempSync(join(tmpdir(), "sdk-select-"));

beforeAll(async () => {
  const result = await build({
    entryPoints: [
      fileURLToPath(new URL("./fixtures/select-page.tsx", import.meta.url)),
    ],
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
    jsx: "automatic",
    jsxImportSource: "maniatsx",
    plugins: [maniatsxEsbuildPlugin()],
    logLevel: "silent",
  });
  const file = join(dir, "page.mjs");
  writeFileSync(file, result.outputFiles[0]!.text);
  pages = await import(pathToFileURL(file).href);
}, 30000);

afterAll(() => rmSync(dir, { recursive: true, force: true }));

const visibleRows = (xml: string) =>
  [...xml.matchAll(/<frame pos="0 [-\d.]+" size="40 4" hidden="(\d)"/g)].map(
    (m) => m[1],
  );

describe("Select", () => {
  it("carries the value in a named entry and shows the selected option", () => {
    const xml = pages.listPage;
    expect(xml).toMatch(/<entry[^>]*name="script-name"[^>]*default="file-3"/);
    expect(xml).toContain('text="Script 3"');
    expect(xml).toContain('text="detail-3"');
    // The selected row plus the hidden glyph label the script copies from
    expect(xml.match(/text="✓"/g)).toHaveLength(2);
  });

  it("shows maxVisible rows with scroll strips when the list is longer", () => {
    const rows = visibleRows(pages.listPage);
    expect(rows).toHaveLength(12);
    expect(rows.filter((hidden) => hidden === "0")).toHaveLength(10);
    expect(pages.listPage).toContain('text="▲"');
    expect(pages.listPage).toContain('text="▼"');
  });

  it("starts in custom mode for a value outside the options", () => {
    const xml = pages.customPage;
    expect(xml).toMatch(/<entry[^>]*default="My\/Own.Script.txt"/);
    expect(xml).toMatch(/text="‹ Back to list"[^>]*hidden="0"/);
    expect(xml).not.toContain('text="▲"');
  });

  it("compiles the client handlers into the page script", () => {
    const script = pages.listPage.match(/<!--([\s\S]*?)-->/)?.[1] ?? "";
    // Plain ManiaScript: no library includes, one declaration block per page
    expect(script).not.toContain('#Include "ColorLib"');
    expect(
      script.match(/declare Integer\[Text\] TmcpSel_Count for Page;/g),
    ).toHaveLength(3);
    expect(script).toContain('HasClass("tmcp-select-pick")');
    expect(script).toContain("CMlScriptEvent::Type::MouseClick");
    expect(script).toContain("CMlScriptEvent::Type::MouseOver");
    expect(script).toContain("StartEdition");
  });
});
