import {
  resolvePreset,
  type ThemeData,
  type ThemeTokens,
} from "@tmcontrolpanel/shared";
import { createThemeKit, type ThemeData as KitThemeData } from "maniatsx/theme";

const defaultTheme = resolvePreset("default");

// Preset themes arrive as data, so the kit's base only supplies the Default tokens and the chain
export const kit = createThemeKit<ThemeTokens>({
  id: defaultTheme.id,
  name: defaultTheme.name,
  tokens: defaultTheme.tokens,
  text: defaultTheme.text,
});

export const DEFAULT_THEME_DATA: ThemeData = defaultTheme;

export const toKitTheme = (theme: ThemeData): KitThemeData<ThemeTokens> =>
  theme;
