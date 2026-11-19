export type ThemeTokens = {
  color: {
    surface: string;
    surfaceAlt: string;
    content: string;
    contentAlt: string;
    text: string;
    textMuted: string;
    contentText: string;
    contentTextMuted: string;
    accent: string;
  };
  font: { body: string; title: string };
  opacity: { panel: number };
};

// Same values as maniatsx's Anchor, so ThemeData passes to its ThemeProvider as is
export type ThemeAnchor =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export type ThemeData = {
  id: string;
  name: string;
  chain: readonly string[];
  tokens: ThemeTokens;
  text: Record<string, string>;
  layout: Record<
    string,
    Partial<{
      anchor: ThemeAnchor;
      margin: [number, number];
      size: [number, number];
      scale: number;
      hidden: boolean;
    }>
  >;
};

export type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export type ThemePresetDefinition = {
  id: string;
  name: string;
  extends?: string;
  tokens: DeepPartial<ThemeTokens>;
  text?: Readonly<Record<string, string>>;
  layout?: Readonly<ThemeData["layout"]>;
};
