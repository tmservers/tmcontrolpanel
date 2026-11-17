import type { ThemeData, ThemeTokens } from "@tmcontrolpanel/shared";
import { resolvePreset } from "@tmcontrolpanel/shared/theme-presets";
import { createThemeKit, type ThemeData as KitThemeData } from "maniatsx/theme";

const defaultTheme = resolvePreset("default");

// The shared theme kit. Presets arrive as data; the base only supplies Default and the chain.
export const kit = createThemeKit<ThemeTokens>({
  id: defaultTheme.id,
  name: defaultTheme.name,
  tokens: defaultTheme.tokens,
  text: defaultTheme.text,
});

export const DEFAULT_THEME_DATA: ThemeData = defaultTheme;

export const toKitTheme = (theme: ThemeData): KitThemeData<ThemeTokens> => theme;

export type { ThemeData, ThemeTokens };
