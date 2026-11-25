import { describe, expect, it, vi } from "vitest";
import type { EventArchive } from "../../src/core/ports";
import { createHarness } from "../fakes/harness";

function archiveFake() {
  return {
    record: vi.fn(
      (_serverId: string, _method: string, _data: unknown): void => {},
    ),
    mark: vi.fn(
      (_serverId: string, _name: string, _payload: object): void => {},
    ),
  } satisfies EventArchive;
}

describe("server event recording", () => {
  it("records callbacks only when recordEvents is enabled", async () => {
    const archive = archiveFake();
    const off = await createHarness({ archive });
    await off.callback("Unknown.Callback", [1]);
    expect(archive.record).not.toHaveBeenCalled();
    await off.runtime.dispose();

    const onArchive = archiveFake();
    const on = await createHarness({
      archive: onArchive,
      server: { recordEvents: true },
    });
    await on.callback("Unknown.Callback", [1]);
    expect(onArchive.record).toHaveBeenCalledWith(
      "server-1",
      "Unknown.Callback",
      [1],
    );
    await on.runtime.dispose();
  });

  it("records callbacks that arrive while EnableCallbacks is pending", async () => {
    const archive = archiveFake();
    const h = await createHarness({
      connect: false,
      archive,
      server: { recordEvents: true },
      configure: (session) =>
        session.respond("EnableCallbacks", () => {
          session.emit("Early.Callback", { early: true });
          return true;
        }),
    });
    await h.runtime.start();
    expect(archive.record).toHaveBeenCalledWith("server-1", "Early.Callback", {
      early: true,
    });
    await h.runtime.dispose();
  });

  it("writes connected and disconnected marks once, and toggles without reconnecting", async () => {
    const archive = archiveFake();
    const h = await createHarness({ archive, server: { recordEvents: true } });
    expect(archive.mark.mock.calls).toEqual([
      ["server-1", "TMControlPanel.Connected", {}],
    ]);
    const sessionCount = h.sessions.length;
    h.servers.servers.get("server-1")!.recordEvents = false;
    await h.runtime.applyServerUpdate();
    expect(archive.mark).toHaveBeenLastCalledWith(
      "server-1",
      "TMControlPanel.Disconnected",
      {},
    );
    h.servers.servers.get("server-1")!.recordEvents = true;
    await h.runtime.applyServerUpdate();
    expect(archive.mark).toHaveBeenLastCalledWith(
      "server-1",
      "TMControlPanel.Connected",
      {},
    );
    expect(h.sessions).toHaveLength(sessionCount);
    await h.runtime.dispose();
  });

  it("continues normal callback handling", async () => {
    const archive = archiveFake();
    const h = await createHarness({ archive, server: { recordEvents: true } });
    const callback = vi.fn();
    h.runtime.events.on("gbxCallback", callback);
    await h.callback("Unrecognized.Callback", ["value"]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(archive.record).toHaveBeenCalledWith(
      "server-1",
      "Unrecognized.Callback",
      ["value"],
    );
    await h.runtime.dispose();
  });
});
