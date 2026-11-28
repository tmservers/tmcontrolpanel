import { getHetznerServer } from "@/actions/hetzner/util";
import { doServerActionWithAuth } from "@/lib/actions";
import { getClient } from "@/lib/dbclient";
import { gbxService } from "@/lib/gbx-service";
import {
  ProvisioningStatus,
  provisioningStage,
} from "@/lib/hetzner-provisioning";
import { assertResourceId } from "@/lib/resource-id";
import { ServerResponse } from "@/types/responses";
import "server-only";

export async function getServerProvisioning(
  projectId: string,
  hetznerServerId: number,
  panelServerId?: string,
): Promise<ServerResponse<ProvisioningStatus>> {
  assertResourceId(projectId);
  return doServerActionWithAuth(
    [
      "hetzner:servers:view",
      `hetzner:${projectId}:moderator`,
      `hetzner:${projectId}:admin`,
    ],
    async () => {
      const server = await getHetznerServer(projectId, hetznerServerId);
      const ip = server.public_net.ipv4?.ip ?? null;

      // Only report on a panel server that actually points at this machine
      let panelConnected: boolean | null = null;
      if (panelServerId && ip) {
        assertResourceId(panelServerId);
        const panelServer = await getClient().servers.findFirst({
          where: { id: panelServerId, host: ip, deletedAt: null },
          select: { id: true },
        });
        if (panelServer) {
          panelConnected = await gbxService
            .serverStatus(panelServer.id)
            .then((status) => status.isConnected)
            .catch(() => false);
        }
      }

      return {
        stage: provisioningStage(server.status, panelConnected),
        hetznerStatus: server.status,
        ip,
        serverType: server.server_type.name,
        createdAt: server.created,
        panelConnected,
      };
    },
  );
}
