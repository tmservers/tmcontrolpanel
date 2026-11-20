import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  infos: vi.fn(),
  download: vi.fn(),
  add: vi.fn(),
  requirePermission: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/logger", () => ({ getLogger: () => ({ warn: vi.fn() }) }));
vi.mock("@/lib/tmevents/oauth", () => ({ tmeventsGet: mocks.get }));
vi.mock("@/lib/api/nadeo", () => ({
  getMapsInfo: mocks.infos,
  downloadFile: mocks.download,
}));
vi.mock("@/actions/gbx/server-only/bulk-maps", () => ({
  addMapFilesAs: mocks.add,
}));
vi.mock("@/lib/actor", () => ({ requirePermission: mocks.requirePermission }));

import { addTmeventsMapsAs } from "@/lib/tmevents/maps";

const actor = { userId: "user", login: "login" } as never;
const tracks = [
  { uid: "a", name: "Track A" },
  { uid: "b", name: "Track B" },
  { uid: "c", name: "Track C" },
];

beforeEach(() => {
  vi.resetAllMocks();
  mocks.get.mockImplementation(async (_user: string, path: string) =>
    path.endsWith("/tracks") ? { tracks } : { name: "Cup" },
  );
  mocks.infos.mockImplementation(async (uids: string[]) => ({
    data: uids
      .filter((uid) => uid !== "c")
      .map((uid) => ({
        mapUid: uid,
        fileUrl: `https://core.trackmania.nadeo.live/maps/${uid}`,
        filename: `${uid}.Map.Gbx`,
      })),
  }));
  mocks.download.mockImplementation(
    async (_url: string, name: string) => new File(["x"], name),
  );
  mocks.add.mockImplementation(async (_a, _s, files: File[]) => ({
    paths: files.map((file) => `Downloaded/Trackmania Events Cup/${file.name}`),
    failed: [],
  }));
});

describe("addTmeventsMapsAs", () => {
  it("adds only the event's tracks and reports the ones Nadeo doesn't have", async () => {
    const result = await addTmeventsMapsAs(actor, "server", "event", [
      "a",
      "c",
      "not-in-event",
    ]);
    expect(mocks.requirePermission).toHaveBeenCalled();
    expect(mocks.infos).toHaveBeenCalledWith(["a", "c"]);
    expect(mocks.add).toHaveBeenCalledWith(
      actor,
      "server",
      [expect.any(File)],
      "Trackmania Events Cup",
      "server.tmevents.maps.add",
      { eventId: "event", uids: ["a"] },
    );
    expect(result).toEqual({
      added: [
        { uid: "a", fileName: "Downloaded/Trackmania Events Cup/a.Map.Gbx" },
      ],
      failed: ["Track C"],
    });
  });

  it("reports failed downloads and server adds by track name", async () => {
    mocks.download.mockImplementation(async (_url: string, name: string) => {
      if (name.startsWith("b")) throw new Error("boom");
      return new File(["x"], name);
    });
    mocks.add.mockResolvedValue({ paths: [], failed: ["a.Map.Gbx"] });
    const result = await addTmeventsMapsAs(actor, "server", "event", [
      "a",
      "b",
    ]);
    expect(result).toEqual({ added: [], failed: ["Track B", "Track A"] });
  });

  it("does nothing when no requested UID is in the event", async () => {
    const result = await addTmeventsMapsAs(actor, "server", "event", ["x"]);
    expect(result).toEqual({ added: [], failed: [] });
    expect(mocks.infos).not.toHaveBeenCalled();
  });
});
