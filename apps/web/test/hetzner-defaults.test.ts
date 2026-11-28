import {
  defaultServerTypeId,
  serverNameFromLogin,
} from "@/lib/hetzner-defaults";
import type { HetznerServerType } from "@/types/api/hetzner/servers";
import { describe, expect, it } from "vitest";

const type = (id: number, name: string, locations: string[]) =>
  ({
    id,
    name,
    prices: locations.map((location) => ({ location })),
  }) as unknown as HetznerServerType;

const types = [
  type(22, "cpx11", ["fsn1", "ash"]),
  type(109, "cpx22", ["fsn1", "ash"]),
  type(114, "cx23", ["fsn1", "nbg1", "hel1"]),
];

describe("defaultServerTypeId", () => {
  it("prefers cx23", () => {
    expect(defaultServerTypeId(types, "fsn1")).toBe("114");
    expect(defaultServerTypeId(types)).toBe("114");
  });

  it("falls back to cpx22 where cx23 is not sold", () => {
    expect(defaultServerTypeId(types, "ash")).toBe("109");
  });

  it("falls back to the first type or empty", () => {
    expect(defaultServerTypeId([type(1, "ccx13", ["fsn1"])], "fsn1")).toBe("1");
    expect(defaultServerTypeId([])).toBe("");
  });
});

describe("serverNameFromLogin", () => {
  it("lowercases logins", () => {
    expect(serverNameFromLogin("PlayerOne")).toBe("playerone");
  });

  it("turns separators into single dashes and trims them", () => {
    expect(serverNameFromLogin("...My__ Server..Name---")).toBe(
      "my-server-name",
    );
  });

  it("caps names at 63 characters without a trailing dash", () => {
    const result = serverNameFromLogin("a".repeat(70));
    expect(result).toHaveLength(63);
    expect(result).not.toMatch(/-$/);
    expect(result).toMatch(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/);

    expect(serverNameFromLogin(`${"a".repeat(62)}-tail`)).not.toMatch(/-$/);
  });

  it.each(["", "---...___"])('uses a fallback for "%s"', (login) => {
    expect(serverNameFromLogin(login)).toBe("trackmania-server");
  });
});
