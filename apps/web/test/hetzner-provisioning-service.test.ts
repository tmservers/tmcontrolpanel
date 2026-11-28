import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getHetznerServer: vi.fn(),
  findFirst: vi.fn(),
  serverStatus: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/actions/hetzner/util", () => ({
  getHetznerServer: mocks.getHetznerServer,
}));
vi.mock("@/lib/dbclient", () => ({
  getClient: () => ({ servers: { findFirst: mocks.findFirst } }),
}));
vi.mock("@/lib/gbx-service", () => ({
  gbxService: { serverStatus: mocks.serverStatus },
}));
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

import { getServerProvisioning } from "@/services/hetzner/provisioning";

const hetznerServer = (ip: string | null = "203.0.113.10") => ({
  status: "running",
  public_net: { ipv4: ip ? { ip } : null },
  server_type: { name: "cx23" },
  created: "2026-10-01T00:00:00+00:00",
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getHetznerServer.mockResolvedValue(hetznerServer());
  mocks.findFirst.mockResolvedValue({ id: "panel-1" });
  mocks.serverStatus.mockResolvedValue({ isConnected: true });
});

describe("getServerProvisioning", () => {
  it("leaves panel connection unknown when no panel server is supplied", async () => {
    const { data } = await getServerProvisioning("project-1", 123);
    expect(data.panelConnected).toBeNull();
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });

  it("looks up the linked server by id and Hetzner IPv4", async () => {
    mocks.findFirst.mockResolvedValue(null);
    const { data } = await getServerProvisioning("project-1", 123, "panel-1");
    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { id: "panel-1", host: "203.0.113.10", deletedAt: null },
      select: { id: true },
    });
    expect(data.panelConnected).toBeNull();
  });

  it("marks a matching connected panel server as connected", async () => {
    const { data } = await getServerProvisioning("project-1", 123, "panel-1");
    expect(data.panelConnected).toBe(true);
    expect(data.stage).toBe("connected");
  });

  it("treats a failed status request as disconnected and installing", async () => {
    mocks.serverStatus.mockRejectedValue(new Error("service unavailable"));
    const { data } = await getServerProvisioning("project-1", 123, "panel-1");
    expect(data.panelConnected).toBe(false);
    expect(data.stage).toBe("installing");
  });

  it("skips the panel lookup when Hetzner has no IPv4", async () => {
    mocks.getHetznerServer.mockResolvedValue(hetznerServer(null));
    const { data } = await getServerProvisioning("project-1", 123, "panel-1");
    expect(data.ip).toBeNull();
    expect(data.panelConnected).toBeNull();
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });
});
