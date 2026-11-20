export interface RankingEntry {
  // Team id in team events, player id otherwise
  id: string;
  seed: number | null;
  // Average finishing position in the event's matches, null before any result
  averagePosition: number | null;
}

// Orders entries for seeding: organiser seeds first, then the ranking order (best
// first, unranked last). Entries the ranking doesn't know keep their place at the end.
export function orderByRanking<T>(
  entries: T[],
  idOf: (entry: T) => string,
  ranking: RankingEntry[],
): T[] {
  const position = new Map(ranking.map((entry, index) => [entry.id, index]));
  const seed = new Map(ranking.map((entry) => [entry.id, entry.seed]));
  const key = (entry: T) => {
    const id = idOf(entry);
    const seeded = seed.get(id);
    return [
      typeof seeded === "number" ? 0 : 1,
      typeof seeded === "number" ? seeded : (position.get(id) ?? Infinity),
    ];
  };
  return entries
    .map((entry, index) => ({ entry, index, key: key(entry) }))
    .sort(
      (a, b) => a.key[0] - b.key[0] || a.key[1] - b.key[1] || a.index - b.index,
    )
    .map(({ entry }) => entry);
}
