import { apiRoute, intParam, parse, parseQuery } from "@/lib/api-route";
import { getServerProvisioning } from "@/services/hetzner/provisioning";
import { z } from "zod";

export const GET = apiRoute<{ projectId: string; serverId: string }>(
  async ({ params, query }) => {
    const p = parse(
      z.object({ serverId: intParam, projectId: z.string() }),
      params,
    );
    const q = parseQuery(
      query,
      z.object({ panelServerId: z.string().uuid().optional() }),
    );
    return getServerProvisioning(p.projectId, p.serverId, q.panelServerId);
  },
);
