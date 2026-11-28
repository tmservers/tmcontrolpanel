import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/lib/actions", () => ({
  doServerActionWithAuth: async (
    _roles: string[],
    callback: () => Promise<unknown>,
  ) => {
    try {
      return { data: await callback() };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },
}));
vi.mock("@/lib/axios/hetzner", () => ({
  axiosHetzner: { get: mocks.get },
}));

import { validateHetznerToken } from "@/actions/hetzner/quick-setup";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.get.mockResolvedValue({ data: { locations: [{}, {}] } });
});

describe("validateHetznerToken", () => {
  it.each(["short", "token with spaces", "token-with-symbols!"])(
    "rejects malformed token %s without calling Hetzner",
    async (token) => {
      const result = await validateHetznerToken(token);
      expect(result.error).toBe("This doesn't look like a Hetzner API token.");
      expect(mocks.get).not.toHaveBeenCalled();
    },
  );

  it("trims the token and sends it as a bearer token", async () => {
    const token = "a".repeat(32);
    const result = await validateHetznerToken(`  ${token}  `);
    expect(mocks.get).toHaveBeenCalledWith("/locations", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(result.data).toEqual({ locations: 2 });
  });

  it("returns the unauthorized error for rejected credentials", async () => {
    mocks.get.mockRejectedValue({ code: "unauthorized" });
    expect((await validateHetznerToken("a".repeat(32))).error).toBe(
      "Hetzner rejected this token.",
    );
  });

  it("returns a reachability error for other failures", async () => {
    mocks.get.mockRejectedValue(new Error("offline"));
    expect((await validateHetznerToken("a".repeat(32))).error).toBe(
      "Could not reach Hetzner to check this token.",
    );
  });
});
