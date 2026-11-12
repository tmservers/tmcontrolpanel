import type { TmeventsEventData, TmeventsStep } from "@/types/api/tmevents";
import type { PluginConfig, TmeventsImportPaths } from "@tmcontrolpanel/shared";

export interface TmeventsImportOptions {
  // Replace the team or player list with the event's
  participants: boolean;
  // Seed by the event's order, otherwise entries keep the seed they have
  seeding: boolean;
  maps: boolean;
  pickBan: boolean;
  // A saved preset instead of the event's own sequence
  presetId?: string;
}

export interface TmeventsImportResult {
  values: PluginConfig;
  // Names of event tracks that are not on the server
  missingMaps: string[];
}

interface Seeded {
  seed?: unknown;
  [key: string]: unknown;
}

function get(values: PluginConfig, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (parent, key) =>
        parent && typeof parent === "object"
          ? (parent as PluginConfig)[key]
          : undefined,
      values,
    );
}

function set(values: PluginConfig, path: string, value: unknown) {
  const keys = path.split(".");
  let parent = values;
  for (const key of keys.slice(0, -1)) {
    const child = parent[key];
    parent = parent[key] =
      child && typeof child === "object" && !Array.isArray(child)
        ? (child as PluginConfig)
        : {};
  }
  parent[keys.at(-1)!] = value;
}

// Pick and ban steps in the form the "order" widget stores: p:1,b:2,r
export function tmeventsOrder(steps: TmeventsStep[]): string {
  return steps
    .map((step) =>
      step.action === "Random"
        ? "r"
        : `${step.action === "Pick" ? "p" : "b"}:${step.participant === "A" ? 1 : 2}`,
    )
    .join(",");
}

// Gives every entry a seed: its position in the event when seeding is imported, else
// the seed the matching entry already had, else the next number nobody uses.
function seed<T extends Seeded>(
  entries: T[],
  existing: Seeded[],
  key: string,
  seeding: boolean,
): T[] {
  if (seeding)
    return entries.map((entry, index) => ({ ...entry, seed: index + 1 }));
  const kept = entries.map((entry) => {
    const match = existing.find(
      (old) => old[key] !== "" && old[key] === entry[key],
    );
    return typeof match?.seed === "number" ? match.seed : undefined;
  });
  const used = new Set(kept.filter((value) => value !== undefined));
  let next = 1;
  return entries.map((entry, index) => {
    if (kept[index] !== undefined) return { ...entry, seed: kept[index] };
    while (used.has(next)) next++;
    used.add(next);
    return { ...entry, seed: next };
  });
}

// Writes the chosen parts of an event into a copy of the form values. Parts the
// plugin did not map in its manifest are skipped.
export function applyTmeventsImport(
  current: PluginConfig,
  paths: TmeventsImportPaths,
  data: TmeventsEventData,
  options: TmeventsImportOptions,
  localMaps: { UId: string; FileName: string }[],
): TmeventsImportResult {
  const values = structuredClone(current);
  const missingMaps: string[] = [];

  const teamBased = data.event.teamBased;
  const path = teamBased ? paths.teams : paths.players;
  const key = teamBased ? "name" : "login";
  if (path) {
    const existing = (
      Array.isArray(get(values, path)) ? get(values, path) : []
    ) as Seeded[];
    if (options.participants) {
      const entries: Seeded[] = teamBased
        ? data.teams.map((team) => ({
            name: team.name,
            players: team.players.map((player) => player.login),
          }))
        : data.players.map((player) => ({ login: player.login }));
      set(values, path, seed(entries, existing, key, options.seeding));
      if (paths.type) set(values, paths.type, teamBased ? "team" : "player");
    } else if (options.seeding) {
      // Only reseed: entries the event knows take its order, the others stay as they are
      const order: unknown[] = teamBased
        ? data.teams.map((team) => team.name)
        : data.players.map((player) => player.login);
      set(
        values,
        path,
        existing.map((entry) => {
          const index = order.indexOf(entry[key]);
          return index < 0 ? entry : { ...entry, seed: index + 1 };
        }),
      );
    }
  }

  if (options.maps && paths.maps) {
    const files: string[] = [];
    for (const track of data.tracks) {
      const map = localMaps.find((local) => local.UId === track.uid);
      if (map) files.push(map.FileName);
      else missingMaps.push(track.name);
    }
    set(values, paths.maps, files);
  }

  if (options.pickBan && paths.order) {
    const preset = data.presets.find((item) => item.id === options.presetId);
    set(values, paths.order, tmeventsOrder(preset?.steps ?? data.sequence));
  }

  return { values, missingMaps };
}
