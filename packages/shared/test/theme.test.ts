import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRESET_ID,
  DEFAULT_THEME,
  legacyManialinkTheme,
  parseTheme,
  parseThemeSetting,
  resolvePreset,
  resolveServerTheme,
  resolveTheme,
  type ThemePresetDefinition,
} from "../src";
import { resolvePresetFromDefinitions } from "../src/themes/registry";

const palette = (c: string) => ({
  foreground: c,
  background: c,
  foregroundMuted: c,
  backgroundMuted: c,
});
const theme = (quad: string, label = quad) => ({
  quad: palette(quad),
  label: palette(label),
});

describe("manialink themes", () => {
  it("normalizes valid colors and refuses invalid ones", () => {
    expect(parseTheme(theme("abc"))).toEqual(theme("ABC"));
    expect(parseTheme(theme("#abc"))).toBeNull();
    expect(parseTheme(theme("abcd"))).toBeNull();
    expect(parseTheme(theme("abc", "def"))).toEqual(theme("ABC", "DEF"));
    expect(parseTheme({ quad: palette("abc") })).toBeNull();
    expect(parseTheme({ foreground: "FFF" })).toBeNull();
    expect(parseTheme(null)).toBeNull();
  });

  it("reads a flat palette saved before the split as both palettes", () => {
    expect(parseTheme(palette("abc"))).toEqual(theme("ABC"));
  });

  it("prefers the server, then the first group with a theme, then the default", () => {
    expect(resolveTheme({ preset: "default" }, [null])).toEqual(DEFAULT_THEME);
    expect(resolveTheme(null, [null, { preset: "default" }])).toEqual(
      DEFAULT_THEME,
    );
    expect(resolveTheme({ broken: true }, [])).toEqual(DEFAULT_THEME);
  });
});

describe("theme presets", () => {
  it("resolves the default preset and falls back for unknown ids", () => {
    expect(resolvePreset(DEFAULT_PRESET_ID)).toMatchObject({
      id: "default",
      name: "Default",
      chain: ["default"],
      tokens: {
        color: {
          surface: "222",
          surfaceAlt: "333",
          content: "DDD",
          contentAlt: "CCC",
          text: "DDD",
          textMuted: "CCC",
          contentText: "222",
          contentTextMuted: "333",
          accent: "DDD",
        },
        font: { body: "GameFontRegular", title: "GameFontSemiBold" },
        opacity: { panel: 0.85 },
      },
    });
    expect(resolvePreset("missing")).toEqual(resolvePreset("default"));
  });

  it("uses the server preset before groups and ignores old color JSON", () => {
    const server = { preset: "default" };
    expect(resolveServerTheme(server, [{ preset: "missing" }]).id).toBe(
      "default",
    );
    expect(parseThemeSetting(palette("ABC"))).toBeNull();
    expect(parseThemeSetting(theme("111"))).toBeNull();
    expect(resolveServerTheme(palette("ABC"), [{ preset: "default" }]).id).toBe(
      "default",
    );
  });

  it("maps the default to the existing Handlebars theme and supports JSON round trips", () => {
    const data = resolvePreset("default");
    expect(legacyManialinkTheme(data)).toEqual(DEFAULT_THEME);
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
    expect(resolveTheme(null, [{ preset: "default" }])).toEqual(DEFAULT_THEME);
  });

  it("deep merges inherited preset data and reports the child-first chain", () => {
    const definitions: ThemePresetDefinition[] = [
      {
        id: "default",
        name: "Default",
        tokens: resolvePreset("default").tokens,
        text: { greeting: "Hello" },
        layout: { panel: { size: [100, 50], anchor: "center" } },
      },
      {
        id: "test-child",
        name: "Test child",
        extends: "default",
        tokens: { color: { accent: "F00" }, opacity: { panel: 0.5 } },
        text: { greeting: "Welcome" },
        layout: { panel: { scale: 2 } },
      },
    ];
    const resolved = resolvePresetFromDefinitions(definitions, "test-child");
    expect(resolved.chain).toEqual(["test-child", "default"]);
    expect(resolved.tokens.color).toMatchObject({
      surface: "222",
      accent: "F00",
    });
    expect(resolved.tokens.opacity.panel).toBe(0.5);
    expect(resolved.text).toEqual({ greeting: "Welcome" });
    expect(resolved.layout.panel).toEqual({
      size: [100, 50],
      anchor: "center",
      scale: 2,
    });
  });
});
