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

export type ThemeData = {
  id: string;
  name: string;
  chain: readonly string[];
  tokens: ThemeTokens;
  text: Record<string, string>;
  layout: Record<
    string,
    Partial<{
      anchor: string;
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
