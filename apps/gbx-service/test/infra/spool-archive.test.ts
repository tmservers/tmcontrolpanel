import { mkdtemp, readdir, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as zlib from "node:zlib";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ObjectStore } from "../../src/core/ports";
import { encodeEvent } from "../../src/infra/archive/event-line";
import { SpoolEventArchive } from "../../src/infra/archive/spool-archive";
import { FakeClock } from "../fakes/clock";
import { silentLogger } from "../fakes/logger";

const decompress = (
  zlib as unknown as { zstdDecompressSync(data: Uint8Array): Buffer }
).zstdDecompressSync;
const dirs: string[] = [];

async function setup(options: Record<string, unknown> = {}) {
  const dir = await mkdtemp(join(tmpdir(), "tmcp-archive-"));
  dirs.push(dir);
  const clock = new FakeClock();
  await utimes(dir, clock.now() / 1000, clock.now() / 1000);
  const objects = new Map<string, Buffer>();
  const put = vi.fn(async (key: string, body: Uint8Array) => {
    objects.set(key, Buffer.from(body));
  });
  const archive = new SpoolEventArchive({
    dir,
    instance: "instance-a",
    store: { put } as ObjectStore,
    clock,
    log: silentLogger,
    maxSpoolBytes: 1024 * 1024,
    ...options,
  } as any);
  return { dir, clock, archive, objects, put };
}

afterEach(async () => {
  await Promise.all(
    dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

describe("SpoolEventArchive", () => {
  it("seals by size and time, uploads compressed lines under the segment key", async () => {
    const h = await setup({ segmentBytes: 1, segmentMs: 10 });
    try {
      await h.archive.start();
      h.archive.record("server-1", "A", { n: 1 });
      await h.archive.flush();
      await h.archive.ship();
      expect(h.objects.size).toBe(1);
      const key = [...h.objects.keys()][0];
      expect(key).toMatch(/^server-1\/1970\/01\/01\/001640-/);
      expect(decompress(h.objects.get(key)!).toString()).toBe(
        encodeEvent(h.clock.now(), "A", { n: 1 }),
      );
      expect(await readdir(h.dir)).toEqual([]);
    } finally {
      await h.archive.close();
    }
  });

  it("seals a segment when its age reaches segmentMs", async () => {
    const h = await setup({ segmentBytes: 10_000, segmentMs: 10 });
    try {
      await h.archive.start();
      h.archive.record("server-1", "Timed", true);
      await h.archive.flush();
      await h.clock.advance(10);
      await h.archive.flush();
      await h.archive.ship();
      expect(h.objects.size).toBe(1);
      expect(decompress([...h.objects.values()][0]).toString()).toContain(
        '"Timed",true',
      );
    } finally {
      await h.archive.close();
    }
  });

  it("does not upload or delete an active segment", async () => {
    const h = await setup();
    try {
      await h.archive.start();
      h.archive.record("server-1", "A", 1);
      await h.archive.flush();
      await h.archive.ship();
      expect(h.put).not.toHaveBeenCalled();
      expect(
        (await readdir(h.dir)).some((name) => name.endsWith(".ndjson")),
      ).toBe(true);
    } finally {
      await h.archive.close();
    }
  });

  it("compresses failed uploads, makes one put attempt per pass, then uploads once", async () => {
    const h = await setup({ segmentBytes: 1 });
    try {
      await h.archive.start();
      h.archive.record("server-1", "A", 1);
      h.archive.record("server-2", "B", 2);
      await h.archive.flush();
      h.put.mockRejectedValueOnce(new Error("offline"));
      await h.archive.ship();
      expect(h.put).toHaveBeenCalledTimes(1);
      const names = await readdir(h.dir);
      expect(names).toHaveLength(2);
      expect(names.every((name) => name.endsWith(".zst"))).toBe(true);
      h.put.mockImplementation(async (key, body) => {
        h.objects.set(key, Buffer.from(body));
      });
      await h.archive.ship();
      expect(h.objects.size).toBe(2);
      expect(
        [...h.objects.values()]
          .map((body) => decompress(body).toString())
          .sort(),
      ).toEqual(
        [
          encodeEvent(h.clock.now(), "A", 1),
          encodeEvent(h.clock.now(), "B", 2),
        ].sort(),
      );
      expect(await readdir(h.dir)).toEqual([]);
    } finally {
      await h.archive.close();
    }
  });

  it("adopts old orphan segments under their original keys and removes old temp files", async () => {
    const h = await setup({ orphanMs: 100 });
    try {
      await h.archive.start();
      const oldName = "server-1~1000000~owner-z~7.ndjson";
      const freshName = "server-2~1000000~owner-z~8.ndjson";
      const temp = join(h.dir, "stale.tmp");
      const line = encodeEvent(1000000, "Old", null);
      const fs = await import("node:fs/promises");
      await fs.writeFile(join(h.dir, oldName), line);
      await fs.writeFile(join(h.dir, freshName), line);
      await fs.writeFile(temp, "tmp");
      const now = new Date(h.clock.now());
      await utimes(join(h.dir, oldName), now, now);
      await utimes(join(h.dir, freshName), now, now);
      await utimes(temp, now, now);
      await h.archive.ship();
      expect(h.put).not.toHaveBeenCalled();
      const old = new Date(h.clock.now() - 200);
      await utimes(join(h.dir, oldName), old, old);
      await utimes(temp, old, old);
      await h.archive.ship();
      expect(
        h.objects.has(
          "server-1/1970/01/01/001640-1000000-owner-z-7.ndjson.zst",
        ),
      ).toBe(true);
      expect(await readdir(h.dir)).toEqual([freshName]);
    } finally {
      await h.archive.close();
    }
  });

  it("writes a dropped marker when the buffer limit is exceeded", async () => {
    const h = await setup({ maxBufferChars: 1 });
    try {
      await h.archive.start();
      h.archive.record("server-1", "A", 1);
      h.archive.record("server-1", "B", 2);
      await h.archive.flush(true);
      await h.archive.ship();
      const text = decompress([...h.objects.values()][0]).toString();
      expect(text).toContain('"TMControlPanel.Dropped",{"count":1}');
    } finally {
      await h.archive.close();
    }
  });

  it("resumes recording after spool space frees", async () => {
    const h = await setup({ maxSpoolBytes: 1, segmentBytes: 1 });
    try {
      await h.archive.start();
      h.archive.record("server-1", "A", 1);
      await h.archive.flush();
      await h.archive.ship();
      h.archive.record("server-1", "Dropped", 0);
      await h.archive.ship();
      h.archive.record("server-1", "B", 2);
      await h.archive.flush(true);
      await h.archive.ship();
      const contents = [...h.objects.values()].map((body) =>
        decompress(body).toString(),
      );
      expect(contents.join("")).toContain(
        '"TMControlPanel.Dropped",{"count":1}',
      );
      expect(contents.join("")).toContain('"B",2');
    } finally {
      await h.archive.close();
    }
  });

  it("counts append failures and records the dropped marker later", async () => {
    const h = await setup();
    try {
      await h.archive.start();
      await rm(h.dir, { recursive: true });
      h.archive.record("server-1", "Lost", 1);
      await h.archive.flush();
      await (await import("node:fs/promises")).mkdir(h.dir);
      h.archive.record("server-1", "Kept", 2);
      await h.archive.flush(true);
      await h.archive.ship();
      expect(decompress([...h.objects.values()][0]).toString()).toContain(
        '"TMControlPanel.Dropped",{"count":1}',
      );
    } finally {
      await h.archive.close();
    }
  });

  it.each([
    [
      "circular",
      () => {
        const value: any = {};
        value.self = value;
        return value;
      },
    ],
    ["bigint", () => 1n],
  ])("does not throw for %s data", (_kind, make) => {
    const h = new SpoolEventArchive({
      dir: "/unused",
      instance: "a",
      store: { put: vi.fn() },
      clock: new FakeClock(),
      log: silentLogger,
      maxSpoolBytes: 100,
    });
    expect(() => h.record("s", "event", make())).not.toThrow();
  });

  it("seals and uploads on close", async () => {
    const h = await setup();
    try {
      await h.archive.start();
      h.archive.record("server-1", "A", 1);
      await h.archive.close();
      expect(h.objects.size).toBe(1);
    } finally {
      await h.archive.close();
    }
  });

  it("returns from close after its timeout when put hangs", async () => {
    const h = await setup({ segmentBytes: 1, closeTimeoutMs: 10 });
    try {
      h.put.mockImplementation(() => new Promise(() => {}));
      await h.archive.start();
      h.archive.record("server-1", "A", 1);
      await h.archive.flush();
      const began = Date.now();
      await h.archive.close();
      expect(Date.now() - began).toBeLessThan(500);
      expect(
        (await readdir(h.dir)).some((name) => name.endsWith(".ndjson")),
      ).toBe(true);
    } finally {
      await rm(h.dir, { recursive: true, force: true });
    }
  });

  it("does not lose or duplicate events recorded during a flush", async () => {
    const h = await setup();
    try {
      await h.archive.start();
      h.archive.record("server-1", "Before", 1);
      const flushing = h.archive.flush(true);
      h.archive.record("server-1", "During", 2);
      await flushing;
      await h.archive.flush(true);
      await h.archive.ship();
      const body = [...h.objects.values()]
        .map((value) => decompress(value).toString())
        .join("");
      expect(body.match(/"Before"/g)).toHaveLength(1);
      expect(body.match(/"During"/g)).toHaveLength(1);
    } finally {
      await h.archive.close();
    }
  });
});
