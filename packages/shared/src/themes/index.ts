import { z } from "zod";
import type { ManialinkTheme } from "../plugins/theme";
import { DEFAULT_PRESET_ID, resolvePreset, THEME_PRESET_IDS } from "./registry";
import type { ThemeData } from "./types";

export {
  DEFAULT_PRESET_ID,
  listThemePresets,
  resolvePreset,
  THEME_PRESET_IDS,
} from "./registry";
export type { ThemePresetId, ThemePresetSummary } from "./registry";
export * from "./types";

export const themeSettingSchema = z.object({
  preset: z.enum(THEME_PRESET_IDS),
});

export function parseThemeSetting(value: unknown): string | null {
  const result = themeSettingSchema.safeParse(value);
  return result.success ? result.data.preset : null;
}

export function resolveServerTheme(
  serverTheme: unknown,
  groupThemes: unknown[] = [],
): ThemeData {
  for (const value of [serverTheme, ...groupThemes]) {
    const preset = parseThemeSetting(value);
    if (preset) return resolvePreset(preset);
  }
  return resolvePreset(DEFAULT_PRESET_ID);
}

export function legacyManialinkTheme(theme: ThemeData): ManialinkTheme {
  const { color } = theme.tokens;
  return {
    quad: {
      foreground: color.content,
      background: color.surface,
      foregroundMuted: color.contentAlt,
      backgroundMuted: color.surfaceAlt,
    },
    label: {
      foreground: color.text,
      background: color.contentText,
      foregroundMuted: color.textMuted,
      backgroundMuted: color.contentTextMuted,
    },
  };
}
