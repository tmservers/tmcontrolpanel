import { doServerActionWithAuth } from "@/lib/actions";
import { getClient } from "@/lib/dbclient";
import { ServerError, ServerResponse } from "@/types/responses";
import { DEFAULT_PRESET_ID, parseThemeSetting } from "@tmcontrolpanel/shared";
import "server-only";

export interface ServerThemeOverview {
  // The server's own theme; null when it uses the inherited one
  theme: string | null;
  // Effective inherited preset
  inherited: string;
  // Group the inherited theme comes from; null for the default
  inheritedFrom: string | null;
}

export async function getServerTheme(
  serverId: string,
): Promise<ServerResponse<ServerThemeOverview>> {
  return doServerActionWithAuth(
    [`servers:${serverId}:admin`, `group:servers:${serverId}:admin`],
    async () => {
      const server = await getClient().servers.findFirst({
        where: { id: serverId, deletedAt: null },
        select: {
          theme: true,
          groupServers: {
            where: { group: { deletedAt: null } },
            select: {
              group: { select: { name: true, theme: true, createdAt: true } },
            },
          },
        },
      });
      if (!server) throw new ServerError("Server not found", "NotFound");

      // Same order as the GBX service: the oldest group with a theme wins
      const group = server.groupServers
        .map((gs) => gs.group)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((g) => ({ name: g.name, theme: parseThemeSetting(g.theme) }))
        .find((g) => g.theme);
      const serverTheme = parseThemeSetting(server.theme);

      return {
        theme: serverTheme,
        inherited: group?.theme ?? DEFAULT_PRESET_ID,
        inheritedFrom: group?.name ?? null,
      };
    },
  );
}
