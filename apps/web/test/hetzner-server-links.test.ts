import { findHetznerServer, toLinkedHetznerServer } from "@/lib/hetzner-link";
import { getHetznerServerLinks } from "@/services/hetzner/server-links";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: {} as any,
  getApiToken: vi.fn(),
  setRateLimit: vi.fn(),
  get: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth", () => ({
  withAuth: async () => ({ user: mocks.user }),
}));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("@/lib/sentry/report", () => ({ reportException: vi.fn() }));
vi.mock("@/actions/hetzner/util", () => ({
  getApiToken: mocks.getApiToken,
  setRateLimit: mocks.setRateLimit,
}));
vi.mock("@/lib/axios/hetzner", () => ({
  axiosHetzner: { get: mocks.get },
}));

const server = (id = 1, extra: Record<string, unknown> = {}) => ({
  id,
  name: `tm-${id}`,
  status: "running",
  created: "2026-10-01T00:00:00+00:00",
  server_type: { name: "cx22", cores: 2, memory: 4, disk: 40 },
  location: { name: "nbg1", city: "Nuremberg", country: "DE" },
  public_net: { ipv4: { ip: "1.2.3.4" } },
  private_net: [{ ip: "10.0.0.1" }, {}, { ip: "" }],
  labels: { superadmin_password: "secret" },
  ...extra,
});

const project = { id: "project-1", name: "Project One" };

function page(
  servers: ReturnType<typeof server>[],
  nextPage: number | null = null,
) {
  return { data: { servers, meta: { pagination: { next_page: nextPage } } } };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = { id: "user", projects: [] };
  mocks.getApiToken.mockResolvedValue("token");
  mocks.setRateLimit.mockResolvedValue(undefined);
  mocks.get.mockResolvedValue(page([]));
});

describe("Hetzner server mapping and matching", () => {
  it("maps safe server fields, omits labels, and uses location name as fallback", () => {
    const input = server(7, {
      location: { name: "nbg1", city: "", country: "DE" },
    });
    const mapped = toLinkedHetznerServer(input as any, project);

    expect(mapped).toEqual({
      id: 7,
      projectId: "project-1",
      projectName: "Project One",
      name: "tm-7",
      status: "running",
      type: "cx22",
      cores: 2,
      memory: 4,
      disk: 40,
      location: "nbg1",
      country: "DE",
      ipv4: "1.2.3.4",
      privateIps: ["10.0.0.1"],
      created: "2026-10-01T00:00:00+00:00",
    });
    expect(mapped).not.toHaveProperty("labels");
  });

  it("maps a missing public ipv4 to null", () => {
    expect(
      toLinkedHetznerServer(
        server(1, { public_net: { ipv4: null } }) as any,
        project,
      ).ipv4,
    ).toBeNull();
  });

  it("matches normalized public IPs before private IPs and returns undefined without a match", () => {
    const publicServer = toLinkedHetznerServer(server() as any, project);
    const privateServer = toLinkedHetznerServer(
      server(2, {
        public_net: { ipv4: null },
        private_net: [{ ip: "1.2.3.4" }],
      }) as any,
      { id: "project-2", name: "Project Two" },
    );

    expect(
      findHetznerServer("  1.2.3.4  ", [privateServer, publicServer]),
    ).toBe(publicServer);
    expect(findHetznerServer(" 10.0.0.1 ", [publicServer])).toBe(publicServer);
    expect(findHetznerServer("", [publicServer])).toBeUndefined();
    expect(findHetznerServer("missing", [publicServer])).toBeUndefined();
  });
});

describe("getHetznerServerLinks", () => {
  it("queries only the session user's projects", async () => {
    mocks.user.projects = [{ id: "mine", name: "Mine" }];
    mocks.get.mockResolvedValue(page([server()]));

    const result = await getHetznerServerLinks();

    expect(mocks.getApiToken).toHaveBeenCalledTimes(1);
    expect(mocks.getApiToken).toHaveBeenCalledWith("mine");
    expect(result.data?.servers).toHaveLength(1);
  });

  it("follows pagination and stops after five pages", async () => {
    mocks.user.projects = [{ id: "mine", name: "Mine" }];
    mocks.get.mockImplementation(async (_url: string, config: any) =>
      page(
        [server(config.params.page)],
        config.params.page < 8 ? config.params.page + 1 : null,
      ),
    );

    const result = await getHetznerServerLinks();

    expect(mocks.get).toHaveBeenCalledTimes(5);
    expect(
      mocks.get.mock.calls.map(([, config]) => config.params.page),
    ).toEqual([1, 2, 3, 4, 5]);
    expect(result.data?.servers.map(({ id }) => id)).toEqual([1, 2, 3, 4, 5]);
  });

  it("records a failing project while returning other project servers without labels", async () => {
    mocks.user.projects = [
      { id: "working", name: "Working Project" },
      { id: "broken", name: "Broken Project" },
    ];
    mocks.getApiToken.mockImplementation(async (id: string) => {
      if (id === "broken") throw new Error("Invalid token");
      return "token";
    });
    mocks.get.mockResolvedValue(page([server()]));

    const result = await getHetznerServerLinks();

    expect(result.data?.errors).toEqual([
      {
        projectId: "broken",
        projectName: "Broken Project",
        error: "Invalid token",
      },
    ]);
    expect(result.data?.servers).toHaveLength(1);
    expect(result.data?.servers[0]).not.toHaveProperty("labels");
    expect(JSON.stringify(result.data)).not.toContain("secret");
  });

  it("returns empty collections when the user has no projects", async () => {
    const result = await getHetznerServerLinks();

    expect(result.data).toEqual({ servers: [], errors: [] });
    expect(mocks.getApiToken).not.toHaveBeenCalled();
    expect(mocks.get).not.toHaveBeenCalled();
  });
});
