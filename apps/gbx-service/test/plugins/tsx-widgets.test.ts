import { packPlugin } from "@tmcontrolpanel/plugin-sdk/cli";
import { resolvePreset } from "@tmcontrolpanel/shared";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createHarness,
  player,
  SERVER_ID,
  type Harness,
} from "../fakes/harness";

// A real TSX plugin project, built with tmcp-plugin's own build and run in the sandbox
const FIXTURE = fileURLToPath(
  new URL("../fixtures/tsx-plugin", import.meta.url),
);

let outDir: string;
let bytes: Uint8Array;

beforeAll(async () => {
  outDir = mkdtempSync(join(tmpdir(), "tmcp-tsx-"));
  bytes = (await packPlugin(FIXTURE, { outDir })).bytes;
}, 60_000);

afterAll(() => rmSync(outDir, { recursive: true, force: true }));

const pages = (h: Harness) =>
  h.session.sent.map((call) => String(call.params[0])).join("\n");

describe("TSX component widgets", () => {
  it("renders the component and its update page with the server's preset", async () => {
    const h = await createHarness({ packages: [{ bytes }] });
    const xml = pages(h);
    const { color } = resolvePreset("default").tokens;

    expect(xml).toContain(`bgcolor="${color.surface}"`);
    expect(xml).toContain(`textcolor="${color.text}"`);
    // Compiled client code: the binding, the click handler and the published value
    expect(xml).toContain("<script>");
    expect(xml).toContain("points = 7");
  });

  it("prefixes actions and storage keys with the plugin", async () => {
    const h = await createHarness({ packages: [{ bytes }] });
    const xml = pages(h);

    expect(xml).toContain('"tsx-demo:pick"');
    expect(xml).toMatch(/Mtx_X_\w*tsx\w*demo\w*score/);
    expect(xml).toMatch(/Mtx_P_\w*tsx\w*demo\w*clicks/);
  });

  it("delivers action arguments to the plugin's handler", async () => {
    const h = await createHarness({
      packages: [{ bytes }],
      players: [player("p1")],
    });

    await h.click("p1", "tsx-demo:pick|42");

    expect(
      h.pluginStorage.values.get(`${SERVER_ID}/plugin-tsx-demo/args`)?.value,
    ).toEqual(["42"]);
  });
});
