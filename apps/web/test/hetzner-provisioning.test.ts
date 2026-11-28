import { provisioningStage } from "@/lib/hetzner-provisioning";
import { describe, expect, it } from "vitest";

describe("provisioningStage", () => {
  it("maps initializing to creating", () => {
    expect(provisioningStage("initializing", null)).toBe("creating");
  });

  it.each(["starting", "off", "rebuilding", "migrating"] as const)(
    "maps %s to booting",
    (status) => {
      expect(provisioningStage(status, null)).toBe("booting");
    },
  );

  it("maps a connected running server to connected", () => {
    expect(provisioningStage("running", true)).toBe("connected");
  });

  it.each([false, null])(
    "maps running with %s connection to installing",
    (connected) => {
      expect(provisioningStage("running", connected)).toBe("installing");
    },
  );

  it.each(["stopping", "deleting", "unknown"])(
    "maps %s to failed",
    (status) => {
      expect(provisioningStage(status as never, null)).toBe("failed");
    },
  );
});
