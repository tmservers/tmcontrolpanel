import {
  addHetznerToken,
  deleteHetznerToken,
  removeHetznerTokenFromGroup,
  setHetznerTokenGroups,
  updateHetznerToken,
} from "@/actions/hetzner/tokens";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: {} as any,
  get: vi.fn(),
  encrypt: vi.fn(),
  projectFindFirst: vi.fn(),
  projectCreate: vi.fn(),
  projectUpdate: vi.fn(),
  groupCount: vi.fn(),
  linkDeleteMany: vi.fn(),
  linkCreateMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth", () => ({
  withAuth: async (permissions: string[] = []) => {
    if (
      permissions.some(
        (permission) =>
          permission === "hetzner:create" &&
          !mocks.user.admin &&
          !mocks.user.permissions.includes(permission),
      )
    ) {
      throw new Error("Unauthorized");
    }
    return { user: mocks.user };
  },
}));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("@/lib/sentry/report", () => ({ reportException: vi.fn() }));
vi.mock("@/lib/axios/hetzner", () => ({ axiosHetzner: { get: mocks.get } }));
vi.mock("@/lib/hetzner", () => ({ encryptHetznerToken: mocks.encrypt }));
vi.mock("@/actions/database/server-only/audit-logs", () => ({
  withAudit: async (write: (tx: any) => unknown) =>
    write({
      hetznerProjects: {
        create: mocks.projectCreate,
        update: mocks.projectUpdate,
      },
      groupHetznerProjects: {
        deleteMany: mocks.linkDeleteMany,
        createMany: mocks.linkCreateMany,
      },
    }),
}));
vi.mock("@/lib/dbclient", () => ({
  getClient: () => ({
    hetznerProjects: { findFirst: mocks.projectFindFirst },
    groups: { count: mocks.groupCount },
  }),
}));

const project = (ownerId = "owner", groupIds: string[] = []) => ({
  id: "project",
  ownerId,
  groupHetznerProjects: groupIds.map((groupId) => ({ groupId })),
});

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: "owner",
    admin: false,
    permissions: [],
    groups: [],
    projects: [],
    servers: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = user();
  mocks.get.mockResolvedValue({});
  mocks.encrypt.mockReturnValue("encrypted-token");
  mocks.projectFindFirst.mockResolvedValue(project());
  mocks.projectCreate.mockResolvedValue({ id: "created" });
  mocks.projectUpdate.mockResolvedValue({});
  mocks.groupCount.mockResolvedValue(1);
  mocks.linkDeleteMany.mockResolvedValue({ count: 1 });
  mocks.linkCreateMany.mockResolvedValue({ count: 1 });
});

describe("addHetznerToken", () => {
  it("requires hetzner:create", async () => {
    const result = await addHetznerToken({ name: "Cloud", token: "token" });
    expect(result.error).toBeDefined();
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("reports a rejected Hetzner token without creating a project", async () => {
    mocks.user = user({ permissions: ["hetzner:create"] });
    const error = Object.assign(new Error("Unauthorized"), {
      isAxiosError: true,
      response: { status: 401 },
    });
    mocks.get.mockRejectedValue(error);

    const result = await addHetznerToken({ name: "Cloud", token: "token" });

    expect(result.error).toBe("Hetzner rejected this API token");
    expect(mocks.projectCreate).not.toHaveBeenCalled();
  });

  it("creates a project owned by the session user with an encrypted token", async () => {
    mocks.user = user({ id: "creator", permissions: ["hetzner:create"] });

    const result = await addHetznerToken({ name: "Cloud", token: "plain" });

    expect(result.data).toEqual({ id: "created" });
    expect(mocks.encrypt).toHaveBeenCalledWith("plain");
    expect(mocks.projectCreate).toHaveBeenCalledWith({
      data: {
        name: "Cloud",
        apiTokens: ["encrypted-token"],
        ownerId: "creator",
      },
      select: { id: true },
    });
  });
});

describe.each([
  ["update", (id: string) => updateHetznerToken(id, { name: "Renamed" })],
  ["delete", (id: string) => deleteHetznerToken(id)],
  ["share", (id: string) => setHetznerTokenGroups(id, [])],
])("token %s ownership", (_label, action) => {
  it("hides a token from non-owners, including shared-group admins", async () => {
    mocks.user = user({
      id: "other",
      groups: [{ id: "g", role: "Admin", servers: [] }],
    });
    mocks.projectFindFirst.mockResolvedValue(project("owner", ["g"]));

    const result = await action("project");

    expect(result.error).toBe("Hetzner token not found");
    expect(mocks.projectUpdate).not.toHaveBeenCalled();
    expect(mocks.linkDeleteMany).not.toHaveBeenCalled();
  });

  it("allows a super admin", async () => {
    mocks.user = user({ id: "root", admin: true });

    const result = await action("project");

    expect(result.error).toBeUndefined();
  });
});

describe("setHetznerTokenGroups", () => {
  it("prevents adding a group the owner does not administer", async () => {
    const result = await setHetznerTokenGroups("project", ["g"]);
    expect(result.error).toBe(
      "You can only share a token with groups you administer",
    );
    expect(mocks.linkCreateMany).not.toHaveBeenCalled();
  });

  it("allows the owner to remove a group they do not administer", async () => {
    mocks.projectFindFirst.mockResolvedValue(project("owner", ["g"]));

    const result = await setHetznerTokenGroups("project", []);

    expect(result.error).toBeUndefined();
    expect(mocks.linkDeleteMany).toHaveBeenCalledWith({
      where: { projectId: "project", groupId: { in: ["g"] } },
    });
    expect(mocks.linkCreateMany).toHaveBeenCalledWith({ data: [] });
  });

  it("rejects a nonexistent or deleted group", async () => {
    mocks.user = user({ groups: [{ id: "g", role: "Admin", servers: [] }] });
    mocks.groupCount.mockResolvedValue(0);

    const result = await setHetznerTokenGroups("project", ["g"]);

    expect(result.error).toBe("Group not found");
    expect(mocks.linkCreateMany).not.toHaveBeenCalled();
  });

  it("deletes only removed links and creates only added links", async () => {
    mocks.user = user({
      groups: [{ id: "added", role: "Admin", servers: [] }],
    });
    mocks.projectFindFirst.mockResolvedValue(
      project("owner", ["keep", "remove"]),
    );

    const result = await setHetznerTokenGroups("project", ["keep", "added"]);

    expect(result.error).toBeUndefined();
    expect(mocks.linkDeleteMany).toHaveBeenCalledWith({
      where: { projectId: "project", groupId: { in: ["remove"] } },
    });
    expect(mocks.linkCreateMany).toHaveBeenCalledWith({
      data: [{ groupId: "added", projectId: "project" }],
    });
  });
});

describe("removeHetznerTokenFromGroup", () => {
  it("allows a group Admin and rejects a Moderator", async () => {
    mocks.user = user({ groups: [{ id: "g", role: "Admin", servers: [] }] });
    expect(
      (await removeHetznerTokenFromGroup("project", "g")).error,
    ).toBeUndefined();
    expect(mocks.linkDeleteMany).toHaveBeenCalledWith({
      where: { projectId: "project", groupId: "g" },
    });

    vi.clearAllMocks();
    mocks.user = user({
      groups: [{ id: "g", role: "Moderator", servers: [] }],
    });
    const result = await removeHetznerTokenFromGroup("project", "g");
    expect(result.error).toBe(
      "You can only remove tokens from groups you administer",
    );
    expect(mocks.linkDeleteMany).not.toHaveBeenCalled();
  });
});

it("deleteHetznerToken removes shares and soft-deletes the project", async () => {
  const result = await deleteHetznerToken("project");

  expect(result.error).toBeUndefined();
  expect(mocks.linkDeleteMany).toHaveBeenCalledWith({
    where: { projectId: "project" },
  });
  expect(mocks.projectUpdate).toHaveBeenCalledWith({
    where: { id: "project" },
    data: { deletedAt: expect.any(Date) },
  });
});
