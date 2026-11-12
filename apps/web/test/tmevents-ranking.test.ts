import { orderByRanking, type RankingEntry } from "@/lib/tmevents/ranking";
import { describe, expect, it } from "vitest";

const teams = ["a", "b", "c", "d", "e"].map((id) => ({ id }));
const order = (ranking: Omit<RankingEntry, "averagePosition">[]) =>
  orderByRanking(
    teams,
    (team) => team.id,
    ranking.map((entry) => ({ ...entry, averagePosition: null })),
  ).map((team) => team.id);

describe("orderByRanking", () => {
  it("puts organiser seeds first, then the ranking order", () => {
    expect(
      order([
        { id: "d", seed: null },
        { id: "c", seed: 2 },
        { id: "a", seed: null },
        { id: "e", seed: 1 },
        { id: "b", seed: null },
      ]),
    ).toEqual(["e", "c", "d", "a", "b"]);
  });

  it("keeps entries the ranking doesn't list at the end, in their own order", () => {
    expect(order([{ id: "c", seed: null }])).toEqual(["c", "a", "b", "d", "e"]);
  });

  it("keeps the original order without a ranking", () => {
    expect(order([])).toEqual(["a", "b", "c", "d", "e"]);
  });
});
