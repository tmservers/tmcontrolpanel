import { describe, expect, it } from "vitest";
import {
  accountIdToLogin,
  buildTable,
  getSpectatorStatus,
  getTeamColors,
  loginToAccountId,
  rankPlayers,
  throttle,
  type PluginContext,
  type ScoresPlayer,
} from "../src";

// Pairs produced by slugid, which the service uses for the same conversion
const ACCOUNTS: [string, string][] = [
  ["6f2d5f5c-8b1e-4d4b-9c3e-1a2b3c4d5e6f", "by1fXIseTUucPhorPE1ebw"],
  ["a1b2c3d4-e5f6-4789-abcd-ef0123456789", "obLD1OX2R4mrze8BI0VniQ"],
  ["00000000-0000-0000-0000-000000000000", "AAAAAAAAAAAAAAAAAAAAAA"],
];

describe("account ids", () => {
  it.each(ACCOUNTS)("converts %s", (accountId, login) => {
    expect(accountIdToLogin(accountId)).toBe(login);
    expect(loginToAccountId(login)).toBe(accountId);
  });

  it("has no account for fake players or other logins", () => {
    expect(loginToAccountId("fakeplayer1")).toBeNull();
    expect(loginToAccountId("too-short")).toBeNull();
    expect(accountIdToLogin("not-a-uuid")).toBeNull();
  });
});

describe("helpers", () => {
  describe("buildTable", () => {
    const columns = [
      { title: "Left", width: 10, key: "left" as const },
      {
        title: "Middle",
        width: 8,
        align: "center" as const,
        key: "middle" as const,
      },
      {
        title: "Right",
        width: 6,
        align: "right" as const,
        key: "right" as const,
      },
    ];

    it("positions column labels and cells by alignment", () => {
      const table = buildTable({
        columns,
        rows: [{ left: "a", middle: "b", right: "c" }],
      });
      expect(table.width).toBe(24);
      expect(
        table.columns.map(({ x, width, halign }) => [x, width, halign]),
      ).toEqual([
        [1, 8, "left"],
        [14, 6, "center"],
        [23, 4, "right"],
      ]);
      expect(table.rows[0].cells.map(({ x, halign }) => [x, halign])).toEqual([
        [1, "left"],
        [14, "center"],
        [23, "right"],
      ]);
    });

    it("uses text, key and empty values and applies cell colors", () => {
      const table = buildTable<{
        missing?: string | null;
        value?: string | null;
      }>({
        columns: [
          { title: "Key", width: 8, key: "missing" },
          { title: "Text", width: 8, text: (row) => row.value },
          { title: "Color", width: 8, key: "value", color: () => "F00" },
        ],
        rows: [
          { missing: null, value: null },
          { missing: undefined, value: "second" },
          {},
        ],
      });
      expect(
        table.rows.map((row) =>
          row.cells.map((cell) => [cell.text, cell.color]),
        ),
      ).toEqual([
        [
          ["", null],
          ["", null],
          ["", "F00"],
        ],
        [
          ["", null],
          ["second", null],
          ["second", "F00"],
        ],
        [
          ["", null],
          ["", null],
          ["", "F00"],
        ],
      ]);
    });

    it("slices rows, clamps pages, and reports empty results", () => {
      const rows = Array.from({ length: 5 }, (_, id) => ({ id }));
      expect(
        buildTable({
          columns: [{ title: "Id", width: 8, key: "id" }],
          rows,
          pageSize: 2,
          page: 2,
        }),
      ).toMatchObject({
        page: 2,
        pages: 3,
        total: 5,
        from: 3,
        to: 4,
        hasPrev: true,
        hasNext: true,
        rows: [{ cells: [{ text: "2" }] }, { cells: [{ text: "3" }] }],
      });
      expect(buildTable({ columns: [], rows, pageSize: 2, page: 0 }).page).toBe(
        1,
      );
      expect(
        buildTable({ columns: [], rows, pageSize: 2, page: 9 }),
      ).toMatchObject({
        page: 3,
        from: 5,
        to: 5,
        hasPrev: true,
        hasNext: false,
      });
      expect(buildTable({ columns: [], rows: [], pageSize: 2 })).toMatchObject({
        pages: 1,
        page: 1,
        from: 0,
        to: 0,
        total: 0,
        hasPrev: false,
        hasNext: false,
      });
    });

    it("keeps pager position constant across pages", () => {
      const options = {
        columns: [],
        rows: Array.from({ length: 8 }, () => ({})),
        pageSize: 3,
      };
      expect(buildTable(options).pagerY).toBe(
        buildTable({ ...options, page: 2 }).pagerY,
      );
      expect(buildTable(options).pagerY).toBe(-17);
    });
  });

  it("reads the spectator bit field", () => {
    expect(getSpectatorStatus(2_551_101)).toEqual({
      spectator: true,
      temporarySpectator: false,
      pureSpectator: true,
      autoTarget: true,
      currentTargetId: 255,
    });
  });

  it("colors the red and blue teams", () => {
    expect(getTeamColors("Blue").mainColor).toBe("22A");
    expect(getTeamColors("Green")).toEqual({
      mainColor: "",
      secondaryColor: "",
      textColor: "",
    });
  });

  it("ranks by time, then by the latest split, with DNFs last", () => {
    const p = (login: string, time: number, checkpoints: number[]) =>
      ({
        login,
        prevracetime: time,
        prevracecheckpoints: checkpoints,
      }) as ScoresPlayer;
    const ranked = rankPlayers([
      p("dnf", -1, []),
      p("tieSlow", 900, [400, 900]),
      p("tieFast", 900, [300, 900]),
      p("fast", 800, [300, 800]),
    ]);
    expect(ranked.map((r) => [r.login, r.position])).toEqual([
      ["fast", 1],
      ["tieFast", 2],
      ["tieSlow", 3],
      ["dnf", 4],
    ]);
  });

  it("throttles to one leading and one trailing run", () => {
    const timers: (() => void)[] = [];
    const ctx = {
      setTimeout: (fn: () => void) => timers.push(fn),
    } as unknown as PluginContext;
    let runs = 0;
    const run = throttle(ctx, () => runs++, 100);

    run();
    run();
    run();
    expect(runs).toBe(1);
    timers.shift()!();
    expect(runs).toBe(2);
    // The trailing run opened a new window that nothing called into
    timers.shift()!();
    expect(runs).toBe(2);
    run();
    expect(runs).toBe(3);
  });
});
