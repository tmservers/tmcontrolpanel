import {
  appendFile,
  mkdir,
  readdir,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import * as zlib from "node:zlib";
import type { Logger } from "../../core/logger";
import type { Clock, EventArchive, ObjectStore } from "../../core/ports";
import { encodeEvent, isScriptReply } from "./event-line";

export interface SpoolArchiveOptions {
  dir: string;
  // Unique per process start, so two processes never write the same file
  instance: string;
  store: ObjectStore;
  clock: Clock;
  log: Logger;
  maxSpoolBytes: number;
  skipReplies?: boolean;
  maxBufferChars?: number;
  segmentBytes?: number;
  segmentMs?: number;
  // Files of another process are adopted once they have been untouched this long
  orphanMs?: number;
  flushMs?: number;
  shipMs?: number;
  statsMs?: number;
  closeTimeoutMs?: number;
}

interface Channel {
  buffer: string;
  // Events in the buffer, and events lost since the last written marker
  events: number;
  dropped: number;
  file: string | null;
  startedAt: number;
  bytes: number;
  // The last append failed and may have left half a line
  torn: boolean;
}

interface Segment {
  name: string;
  serverId: string;
  startedAt: number;
  instance: string;
  seq: string;
  compressed: boolean;
}

// @types/node predates zstd in node:zlib (Node 22.15 / 23.8)
const { zstdCompress, constants } = zlib as unknown as {
  zstdCompress?: (
    data: Uint8Array,
    options: { params: Record<number, number> },
    callback: (error: Error | null, result: Buffer) => void,
  ) => void;
  constants: { ZSTD_c_compressionLevel: number };
};

// Runs on the thread pool; higher levels cost far more time for about 10% less output
function compress(data: Uint8Array): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zstdCompress!(
      data,
      { params: { [constants.ZSTD_c_compressionLevel]: 1 } },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
  });
}

const SEGMENT = /^([\w-]+)~(\d+)~([A-Za-z0-9-]+)~(\d+)\.ndjson(\.zst)?$/;
const TEMP = /\.tmp$/;
const DROPPED = "TMControlPanel.Dropped";

const isMissing = (error: unknown) =>
  (error as NodeJS.ErrnoException)?.code === "ENOENT";

function parseSegment(name: string): Segment | null {
  const match = SEGMENT.exec(name);
  if (!match) return null;
  return {
    name,
    serverId: match[1],
    startedAt: Number(match[2]),
    instance: match[3],
    seq: match[4],
    compressed: match[5] !== undefined,
  };
}

// Follows from the file name alone, so uploading a segment twice is harmless
export function segmentKey(segment: Omit<Segment, "name" | "compressed">) {
  const iso = new Date(segment.startedAt).toISOString();
  const day = iso.slice(0, 10).replaceAll("-", "/");
  const time = iso.slice(11, 19).replaceAll(":", "");
  return `${segment.serverId}/${day}/${time}-${segment.startedAt}-${segment.instance}-${segment.seq}.ndjson.zst`;
}

// Buffers events in memory, appends them to spool files and uploads sealed files.
// The directory is the queue. Disk work is sequential so it never fills the thread pool.
export class SpoolEventArchive implements EventArchive {
  private readonly channels = new Map<string, Channel>();
  private readonly active = new Set<string>();
  private readonly timers: NodeJS.Timeout[] = [];
  private readonly instance: string;
  private buffered = 0;
  private seq = 0;
  private full = false;
  private closed = false;
  private flushing: Promise<void> | null = null;
  private shipping: Promise<void> | null = null;
  private stats = {
    events: 0,
    dropped: 0,
    written: 0,
    objects: 0,
    uploaded: 0,
  };

  constructor(private readonly options: SpoolArchiveOptions) {
    this.instance = options.instance.replace(/[^A-Za-z0-9]+/g, "-");
  }

  // Throws when the spool cannot be used, so a wrong mount shows up at startup
  async start(): Promise<void> {
    if (!zstdCompress)
      throw new Error("The event archive needs Node 22.15, 23.8 or newer");
    const { dir } = this.options;
    await mkdir(dir, { recursive: true });
    const probe = join(dir, `${this.instance}.tmp`);
    await writeFile(probe, "");
    await unlink(probe);

    this.every(this.options.flushMs ?? 2000, () => void this.flush());
    this.every(this.options.shipMs ?? 15_000, () => void this.ship());
    this.every(this.options.statsMs ?? 600_000, () => this.logStats());
  }

  record(serverId: string, method: string, data: unknown): void {
    try {
      if (this.options.skipReplies && isScriptReply(method, data)) return;
      this.append(serverId, method, data);
    } catch {
      // Not encodable; the game path must not notice
      this.channel(serverId).dropped++;
      this.stats.dropped++;
    }
  }

  mark(serverId: string, name: string, payload: object): void {
    this.record(serverId, name, payload);
  }

  // Seals everything and uploads what fits in the time limit; the rest stays in the spool
  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.timers.forEach(clearInterval);

    await this.flushing;
    await this.flush(true);
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<void>((resolve) => {
      timer = setTimeout(resolve, this.options.closeTimeoutMs ?? 4000);
    });
    const ship = async () => {
      await this.shipping;
      await this.ship();
    };
    await Promise.race([ship(), timeout]);
    clearTimeout(timer);
    this.logStats();
  }

  flush(seal = false): Promise<void> {
    this.flushing ??= this.runFlush(seal).finally(() => {
      this.flushing = null;
    });
    return this.flushing;
  }

  ship(): Promise<void> {
    this.shipping ??= this.runShip()
      .catch((error) =>
        this.options.log.warn({ err: error }, "Event archive upload failed"),
      )
      .finally(() => {
        this.shipping = null;
      });
    return this.shipping;
  }

  private every(ms: number, run: () => void): void {
    const timer = setInterval(run, ms);
    timer.unref();
    this.timers.push(timer);
  }

  private channel(serverId: string): Channel {
    let channel = this.channels.get(serverId);
    if (!channel) {
      channel = {
        buffer: "",
        events: 0,
        dropped: 0,
        file: null,
        startedAt: 0,
        bytes: 0,
        torn: false,
      };
      this.channels.set(serverId, channel);
    }
    return channel;
  }

  private append(serverId: string, method: string, data: unknown): void {
    const channel = this.channel(serverId);
    if (
      this.full ||
      this.closed ||
      this.buffered >= (this.options.maxBufferChars ?? 32 * 1024 * 1024)
    ) {
      channel.dropped++;
      this.stats.dropped++;
      return;
    }
    const line = encodeEvent(this.options.clock.now(), method, data);
    channel.buffer += line;
    channel.events++;
    this.buffered += line.length;
    this.stats.events++;
  }

  private async runFlush(seal: boolean): Promise<void> {
    const now = this.options.clock.now();
    for (const [serverId, channel] of this.channels) {
      if (channel.buffer || (channel.dropped > 0 && !this.full))
        await this.write(serverId, channel, now);

      const { file } = channel;
      if (!file) {
        if (!channel.buffer && channel.dropped === 0)
          this.channels.delete(serverId);
        continue;
      }
      const due =
        channel.bytes >= (this.options.segmentBytes ?? 1024 * 1024) ||
        now - channel.startedAt >= (this.options.segmentMs ?? 3_600_000);
      if (!seal && !due) continue;
      channel.file = null;
      channel.bytes = 0;
      channel.torn = false;
      // From here the shipper may take it
      this.active.delete(file);
    }
  }

  private async write(
    serverId: string,
    channel: Channel,
    now: number,
  ): Promise<void> {
    const { events, dropped, buffer } = channel;
    const marker =
      dropped > 0 ? encodeEvent(now, DROPPED, { count: dropped }) : "";
    const bytes = Buffer.from((channel.torn ? "\n" : "") + buffer + marker);
    channel.buffer = "";
    channel.events = 0;
    channel.dropped = 0;
    this.buffered -= buffer.length;

    if (!channel.file) {
      channel.startedAt = now;
      channel.file = `${serverId}~${now}~${this.instance}~${++this.seq}.ndjson`;
      this.active.add(channel.file);
    }
    try {
      await appendFile(join(this.options.dir, channel.file), bytes);
      channel.bytes += bytes.length;
      channel.torn = false;
      this.stats.written += bytes.length;
    } catch (error) {
      channel.torn = true;
      channel.dropped += dropped + events;
      this.stats.dropped += events;
      this.options.log.warn(
        { err: error, serverId },
        "Could not write events to the spool",
      );
    }
  }

  private async runShip(): Promise<void> {
    const { dir, clock } = this.options;
    const names = (await readdir(dir)).sort();
    const ready: Segment[] = [];
    let total = 0;
    for (const name of names) {
      const info = await stat(join(dir, name)).catch(() => null);
      if (!info?.isFile()) continue;
      total += info.size;
      const segment = parseSegment(name);
      const old =
        clock.now() - info.mtimeMs >= (this.options.orphanMs ?? 7_200_000);
      if (segment) {
        const own = segment.instance === this.instance;
        if (own ? !this.active.has(name) : old) ready.push(segment);
      } else if (TEMP.test(name) && old) {
        await unlink(join(dir, name)).catch(() => undefined);
      }
    }
    this.setFull(total);

    // Oldest first. Once a put fails, the rest is only compressed, to keep the spool small.
    ready.sort((a, b) => a.startedAt - b.startedAt);
    let failure: { error: unknown } | null = null;
    for (const segment of ready) {
      if (failure && segment.compressed) continue;
      const body = await this.load(segment);
      if (!body) continue;
      if (!failure) {
        try {
          await this.options.store.put(segmentKey(segment), body);
          await this.remove(segment.name);
          this.stats.objects++;
          this.stats.uploaded += body.length;
          continue;
        } catch (error) {
          failure = { error };
        }
      }
      if (!segment.compressed) await this.shrink(segment, body);
    }
    if (failure) throw failure.error;
  }

  private setFull(total: number): void {
    const full = total >= this.options.maxSpoolBytes;
    if (full === this.full) return;
    this.full = full;
    if (full)
      this.options.log.error(
        { bytes: total },
        "Event spool is full, dropping events until uploads catch up",
      );
    else this.options.log.info("Event spool has room again");
  }

  // The compressed segment; null when another process handled this orphan first
  private async load(segment: Segment): Promise<Buffer | null> {
    const data = await readFile(join(this.options.dir, segment.name)).catch(
      (error) => {
        if (isMissing(error)) return null;
        throw error;
      },
    );
    if (!data || segment.compressed) return data;
    return compress(data);
  }

  // Replaces a raw segment with its compressed form, through a rename so it is never half written
  private async shrink(segment: Segment, body: Buffer): Promise<void> {
    const target = join(this.options.dir, `${segment.name}.zst`);
    const temp = `${target}.${this.instance}.tmp`;
    await writeFile(temp, body);
    await rename(temp, target);
    await this.remove(segment.name);
  }

  private async remove(name: string): Promise<void> {
    await unlink(join(this.options.dir, name)).catch((error) => {
      if (!isMissing(error)) throw error;
    });
  }

  private logStats(): void {
    const stats = this.stats;
    this.stats = { events: 0, dropped: 0, written: 0, objects: 0, uploaded: 0 };
    if (Object.values(stats).some((value) => value > 0))
      this.options.log.info(stats, "Event archive");
  }
}
