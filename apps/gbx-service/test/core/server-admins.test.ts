import { describe, expect, it, vi } from "vitest";
import { ServerAdmins } from "../../src/core/server/server-admins";
import { FakeClock } from "../fakes/clock";
import { silentLogger } from "../fakes/logger";

describe("ServerAdmins", () => {
  it("caches lookups until the TTL expires", async () => {
    const clock = new FakeClock();
    const resolve = vi.fn(async () => true);
    const admins = new ServerAdmins("s", resolve, clock, silentLogger);
    expect(await admins.isAdmin("a")).toBe(true);
    expect(await admins.isAdmin("a")).toBe(true);
    expect(resolve).toHaveBeenCalledTimes(1);
    clock.advance(60_000);
    await admins.isAdmin("a");
    expect(resolve).toHaveBeenCalledTimes(2);
  });

  it("fails closed for errors, missing resolver, and empty logins", async () => {
    const clock = new FakeClock();
    const broken = new ServerAdmins(
      "s",
      async () => {
        throw new Error("no");
      },
      clock,
      silentLogger,
    );
    const absent = new ServerAdmins("s", null, clock, silentLogger);
    expect(await broken.isAdmin("a")).toBe(false);
    expect(await absent.isAdmin("a")).toBe(false);
    expect(await absent.isAdmin("")).toBe(false);
  });

  it("emits connected admin additions and removals", async () => {
    const admins = new ServerAdmins(
      "s",
      async (_s, login) => login === "a",
      new FakeClock(),
      silentLogger,
    );
    const changes: string[][] = [];
    admins.onChange((logins) => changes.push([...logins]));
    await admins.playerConnected("a");
    await admins.playerConnected("b");
    expect(admins.connectedAdmins()).toEqual(["a"]);
    admins.playerDisconnected("a");
    expect(changes).toEqual([["a"], []]);
  });

  it("replaces connected admins on sync and ignores stale syncs", async () => {
    const gates = new Map<string, (value: boolean) => void>();
    const admins = new ServerAdmins(
      "s",
      (_s, login) => new Promise((resolve) => gates.set(login, resolve)),
      new FakeClock(),
      silentLogger,
    );
    const stale = admins.sync(["old"]);
    await Promise.resolve();
    const fresh = admins.sync(["new"]);
    await Promise.resolve();
    gates.get("new")!(true);
    await fresh;
    gates.get("old")!(true);
    await stale;
    expect(admins.connectedAdmins()).toEqual(["new"]);
    const replace = new ServerAdmins(
      "s",
      async (_s, login) => login === "c",
      new FakeClock(),
      silentLogger,
    );
    await replace.sync(["a", "c"]);
    await replace.sync(["a"]);
    expect(replace.connectedAdmins()).toEqual([]);
  });
});
