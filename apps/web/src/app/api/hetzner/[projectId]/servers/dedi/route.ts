import { apiRoute, parse } from "@/lib/api-route";
import { getDediServers } from "@/services/hetzner/servers";
import { z } from "zod";

export const GET = apiRoute<{ projectId: string }>(async ({ params }) => {
  const p = parse(z.object({ projectId: z.string() }), params);
  return getDediServers(p.projectId);
});
