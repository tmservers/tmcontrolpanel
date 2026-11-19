import type {
  DeepPartial,
  ThemeData,
  ThemePresetDefinition,
  ThemeTokens,
} from "./types";

const DEFAULT_TOKENS: ThemeTokens = {
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
    record: "DDD",
  },
  font: { body: "GameFontRegular", title: "GameFontSemiBold" },
  opacity: { panel: 0.85, surface: 1, content: 1 },
  shape: { radius: 0, gap: 0 },
};

// See-through black panels with white text and a slight corner radius.
// Colors stay three-digit: templates and older plugin bundles append an alpha digit to them.
const BROADCAST: ThemePresetDefinition = {
  id: "broadcast",
  name: "Broadcast",
  extends: "default",
  tokens: {
    color: {
      surface: "000",
      surfaceAlt: "000",
      content: "000",
      contentAlt: "000",
      text: "EEF",
      textMuted: "9AB",
      contentText: "EEF",
      contentTextMuted: "9AB",
      accent: "FFF",
      record: "EB4",
    },
    font: { body: "RajdhaniMono", title: "Oswald" },
    opacity: { surface: 0.86, content: 0.72 },
    shape: { radius: 0, gap: 0.5 },
  },
};

const registry: readonly ThemePresetDefinition[] = [
  { id: "default", name: "Default", tokens: DEFAULT_TOKENS },
  BROADCAST,
];

export const DEFAULT_PRESET_ID = "default";
export const THEME_PRESET_IDS = ["default", "broadcast"] as const;
export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];
export type ThemePresetSummary = { id: ThemePresetId; name: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone<T>(value: T): T {
  if (Array.isArray(value)) return value.map(clone) as T;
  if (isRecord(value))
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, clone(item)]),
    ) as T;
  return value;
}

function deepMerge<T>(base: T, patch: DeepPartial<T>): T {
  if (Array.isArray(patch)) return clone(patch) as T;
  if (!isRecord(base) || !isRecord(patch)) return clone(patch) as T;
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    result[key] =
      key in base ? deepMerge(base[key], value as never) : clone(value);
  }
  return result as T;
}

function resolveFrom(
  definitions: readonly ThemePresetDefinition[],
  id: string,
): ThemeData {
  const byId = new Map(
    definitions.map((definition) => [definition.id, definition]),
  );
  const selected = byId.get(id) ?? byId.get(DEFAULT_PRESET_ID)!;
  const lineage: ThemePresetDefinition[] = [];
  let current: ThemePresetDefinition | undefined = selected;
  const seen = new Set<string>();
  while (current) {
    if (seen.has(current.id))
      throw new Error(`Theme preset cycle at "${current.id}"`);
    seen.add(current.id);
    lineage.push(current);
    current = current.extends ? byId.get(current.extends) : undefined;
  }
  if (lineage.at(-1)?.id !== DEFAULT_PRESET_ID)
    throw new Error(`Theme preset "${id}" must extend "${DEFAULT_PRESET_ID}"`);
  let tokens = clone(DEFAULT_TOKENS);
  const text: Record<string, string> = {};
  const layout: ThemeData["layout"] = {};
  for (const definition of lineage.reverse()) {
    tokens = deepMerge<ThemeTokens>(tokens, definition.tokens);
    Object.assign(text, definition.text);
    for (const [key, value] of Object.entries(definition.layout ?? {}))
      layout[key] = { ...layout[key], ...value };
  }
  return {
    id: selected.id,
    name: selected.name,
    chain: lineage.map((item) => item.id).reverse(),
    tokens,
    text,
    layout,
  };
}

export function listThemePresets(): ThemePresetSummary[] {
  return registry.map(({ id, name }) => ({ id: id as ThemePresetId, name }));
}

export function resolvePreset(id: string): ThemeData {
  return resolveFrom(registry, id);
}

// Kept module-local to the themes implementation for focused inheritance tests.
export const resolvePresetFromDefinitions = resolveFrom;
