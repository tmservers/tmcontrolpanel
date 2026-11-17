"use server";
import { assertResourceId } from "@/lib/resource-id";

import { doServerActionWithAuth } from "@/lib/actions";
import { getClient } from "@/lib/dbclient";
import { publishServerEvent } from "@/lib/gbx-service";
import { ServerError, ServerResponse } from "@/types/responses";
import { Prisma } from "@tmcontrolpanel/db";
import { themeSettingSchema } from "@tmcontrolpanel/shared";
import { logAudit } from "./server-only/audit-logs";
import { groupServerIds, publishThemeChange } from "./server-only/themes";

function parseInput(theme: unknown) {
  if (theme === null) return Prisma.DbNull;
  const result = themeSettingSchema.safeParse(theme);
  if (!result.success)
    throw new ServerError("Invalid theme preset", "InvalidTheme");
  return result.data;
}

// null removes the server's own theme, so it uses its group's or the default again
export async function updateServerTheme(
  serverId: string,
  theme: { preset: string } | null,
): Promise<ServerResponse> {
  assertResourceId(serverId);
  return doServerActionWithAuth(
    [`servers:${serverId}:admin`, `group:servers:${serverId}:admin`],
    async (session) => {
      const data = parseInput(theme);
      const { count } = await getClient().servers.updateMany({
        where: { id: serverId, deletedAt: null },
        data: { theme: data },
      });
      if (count === 0) throw new ServerError("Server not found", "NotFound");

      await logAudit(session.user.id, serverId, "server.theme.edit", {
        theme,
      });
      await publishServerEvent({ type: "server.updated", serverId });
    },
  );
}

export async function updateGroupTheme(
  groupId: string,
  theme: { preset: string } | null,
): Promise<ServerResponse> {
  assertResourceId(groupId);
  return doServerActionWithAuth(
    ["groups:edit", `groups:${groupId}:admin`],
    async (session) => {
      const data = parseInput(theme);
      const db = getClient();
      const { count } = await db.groups.updateMany({
        where: { id: groupId, deletedAt: null },
        data: { theme: data },
      });
      if (count === 0) throw new ServerError("Group not found", "NotFound");

      await logAudit(session.user.id, groupId, "group.theme.edit", { theme });
      await publishThemeChange(await groupServerIds(groupId));
    },
  );
}
