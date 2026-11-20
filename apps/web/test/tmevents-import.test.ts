import { applyTmeventsImport, tmeventsOrder } from "@/lib/tmevents/import";
import type { TmeventsEventData, TmeventsStep } from "@/types/api/tmevents";
import type { PluginConfig, TmeventsImportPaths } from "@tmcontrolpanel/shared";
import { describe, expect, it } from "vitest";

const paths: TmeventsImportPaths = {
  maps: "maps",
  teams: "pickAndBan.teams",
  players: "pickAndBan.players",
  type: "pickAndBan.type",
  order: "pickAndBan.order",
};
const base: TmeventsEventData = {
  event: {
    id: "e",
    slug: "e",
    name: "Event",
    url: "",
    startsAt: "",
    endsAt: "",
    teamBased: true,
  },
  teams: [
    { name: "Red", players: [{ login: "r1", name: "R1" }] },
    { name: "Blue", players: [{ login: "b1", name: "B1" }] },
  ],
  players: [{ login: "solo", name: "Solo" }],
  tracks: [],
  sequence: [],
  presets: [],
};
const importEvent = (
  current: PluginConfig,
  data = base,
  options = { participants: true, seeding: true, maps: false, pickBan: false },
) => applyTmeventsImport(current, paths, data, options, []);

describe("Trackmania Events import", () => {
  it("converts pick and ban steps to the order widget format", () => {
    const steps: TmeventsStep[] = [
      { action: "Pick", participant: "A" },
      { action: "Ban", participant: "B" },
      { action: "Random", participant: "A" },
    ];
    expect(tmeventsOrder(steps)).toBe("p:1,b:2,r");
    expect(tmeventsOrder([])).toBe("");
  });

  it("replaces team entries, assigns event seeds, and sets team type", () => {
    expect(importEvent({ pickAndBan: { teams: [] } }).values).toEqual({
      pickAndBan: {
        teams: [
          { name: "Red", players: ["r1"], seed: 1 },
          { name: "Blue", players: ["b1"], seed: 2 },
        ],
        type: "team",
      },
    });
  });

  it("writes non-team players and type", () => {
    const data = { ...base, event: { ...base.event, teamBased: false } };
    expect(importEvent({}, data).values).toEqual({
      pickAndBan: { players: [{ login: "solo", seed: 1 }], type: "player" },
    });
  });

  it("keeps matching seeds without seeding and assigns lowest unused seed to new entries", () => {
    const data = {
      ...base,
      teams: [base.teams[0], { name: "Green", players: [] }],
    };
    expect(
      importEvent({ pickAndBan: { teams: [{ name: "Red", seed: 3 }] } }, data, {
        participants: true,
        seeding: false,
        maps: false,
        pickBan: false,
      }).values.pickAndBan,
    ).toEqual({
      teams: [
        { name: "Red", players: ["r1"], seed: 3 },
        { name: "Green", players: [], seed: 1 },
      ],
      type: "team",
    });
  });

  it("reseeds known existing entries while leaving unknown entries untouched", () => {
    const current = {
      pickAndBan: {
        teams: [
          { name: "Blue", seed: 9 },
          { name: "Other", seed: 5 },
          { name: "Red", seed: 7 },
        ],
      },
    };
    expect(
      importEvent(current, base, {
        participants: false,
        seeding: true,
        maps: false,
        pickBan: false,
      }).values.pickAndBan,
    ).toEqual({
      teams: [
        { name: "Blue", seed: 2 },
        { name: "Other", seed: 5 },
        { name: "Red", seed: 1 },
      ],
    });
  });

  it("matches maps by UID in event order and returns missing track names", () => {
    const data = {
      ...base,
      tracks: [
        { uid: "u2", name: "Two" },
        { uid: "missing", name: "Lost" },
        { uid: "u1", name: "One" },
      ],
    };
    expect(
      applyTmeventsImport(
        {},
        paths,
        data,
        { participants: false, seeding: false, maps: true, pickBan: false },
        [
          { UId: "u1", FileName: "one.Map.Gbx" },
          { UId: "u2", FileName: "two.Map.Gbx" },
        ],
      ),
    ).toEqual({
      values: { maps: ["two.Map.Gbx", "one.Map.Gbx"] },
      missingMaps: ["Lost"],
    });
  });

  it("uses a matching preset and otherwise uses the event sequence", () => {
    const data = {
      ...base,
      sequence: [{ action: "Pick", participant: "B" }] as TmeventsStep[],
      presets: [
        {
          id: "p",
          name: "Preset",
          steps: [{ action: "Ban", participant: "A" }] as TmeventsStep[],
        },
      ],
    };
    expect(
      applyTmeventsImport(
        {},
        paths,
        data,
        {
          participants: false,
          seeding: false,
          maps: false,
          pickBan: true,
          presetId: "p",
        },
        [],
      ).values.pickAndBan,
    ).toEqual({ order: "b:1" });
    expect(
      applyTmeventsImport(
        {},
        paths,
        data,
        {
          participants: false,
          seeding: false,
          maps: false,
          pickBan: true,
          presetId: "absent",
        },
        [],
      ).values.pickAndBan,
    ).toEqual({ order: "p:2" });
  });

  it("skips unmapped paths, creates nested paths, and preserves the input", () => {
    const current = { untouched: { value: true } };
    const original = structuredClone(current);
    const result = applyTmeventsImport(
      current,
      { teams: "missing.deep.teams" },
      base,
      { participants: true, seeding: true, maps: true, pickBan: true },
      [],
    );
    expect(result.values).toEqual({
      untouched: { value: true },
      missing: {
        deep: {
          teams: [
            { name: "Red", players: ["r1"], seed: 1 },
            { name: "Blue", players: ["b1"], seed: 2 },
          ],
        },
      },
    });
    expect(result.missingMaps).toEqual([]);
    expect(current).toEqual(original);
    expect(importEvent({}, base).values).not.toHaveProperty("maps");
  });
});
