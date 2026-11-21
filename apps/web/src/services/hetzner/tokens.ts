import { doServerActionWithAuth } from "@/lib/actions";
import { getClient } from "@/lib/dbclient";
import { decryptHetznerToken } from "@/lib/hetzner";
import { getList, hasPermissionSync } from "@/lib/utils";
import { ServerResponse } from "@/types/responses";
import "server-only";

export interface HetznerTokenSummary {
  id: string;
  name: string;
  // Last characters only, so the owner can tell tokens apart; the token never leaves the server
  tokenHint: string | null;
  groups: { id: string; name: string }[];
  createdAt: Date;
}

export interface MyHetznerTokens {
  tokens: HetznerTokenSummary[];
  canAdd: boolean;
  // Groups the user may share a token with
  shareableGroups: { id: string; name: string }[];
}

function tokenHint(encrypted: string | undefined): string | null {
  if (!encrypted) return null;
  try {
    return decryptHetznerToken(encrypted).slice(-4);
  } catch {
    return null;
  }
}

export async function getMyHetznerTokens(): Promise<
  ServerResponse<MyHetznerTokens>
> {
  return doServerActionWithAuth([], async (session) => {
    const db = getClient();

    const [projects, groups] = await Promise.all([
      db.hetznerProjects.findMany({
        where: { ownerId: session.user.id, deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          apiTokens: true,
          createdAt: true,
          groupHetznerProjects: {
            where: { group: { deletedAt: null } },
            select: { group: { select: { id: true, name: true } } },
          },
        },
      }),
      db.groups.findMany({
        where: { deletedAt: null },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);

    return {
      tokens: projects.map((p) => ({
        id: p.id,
        name: p.name,
        tokenHint: tokenHint(getList<string>(p.apiTokens)[0]),
        groups: p.groupHetznerProjects.map((g) => g.group),
        createdAt: p.createdAt,
      })),
      canAdd: hasPermissionSync(session, ["hetzner:create"]),
      shareableGroups: groups.filter((g) =>
        hasPermissionSync(session, ["groups:edit", "groups:id:admin"], g.id),
      ),
    };
  });
}
