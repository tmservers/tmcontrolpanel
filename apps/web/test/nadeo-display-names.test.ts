import slugid from "slugid";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ names: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/nadeo", () => ({ getAccountNames: mocks.names }));
vi.mock("@/lib/actions", () => ({
  doServerActionWithAuth: async (_roles: string[], action: () => unknown) => ({
    data: await action(),
  }),
}));

import { getDisplayNamesByLogins } from "@/services/nadeo/display-names";

const accountId = "2fca8bd4-4f6a-4a7e-9f0e-6f1b8f3c2d11";
const login = slugid.encode(accountId);

beforeEach(() => vi.resetAllMocks());

describe("getDisplayNamesByLogins", () => {
  it("looks up account ids and returns names keyed by login", async () => {
    mocks.names.mockResolvedValue({ [accountId]: "Marijn." });
    const { data } = await getDisplayNamesByLogins([login]);
    expect(mocks.names).toHaveBeenCalledWith([accountId]);
    expect(data).toEqual({ [login]: "Marijn." });
  });

  it("leaves out accounts Nadeo has no name for", async () => {
    mocks.names.mockResolvedValue({});
    const { data } = await getDisplayNamesByLogins([login]);
    expect(data).toEqual({});
  });
});
