import { doServerActionWithAuth } from "@/lib/actions";
import { getClient } from "@/lib/dbclient";
import { PaginationResponse, ServerResponse } from "@/types/responses";
import { PaginationState } from "@tanstack/react-table";
import { Prisma } from "@tmcontrolpanel/db";
import "server-only";

// Tokens are left out on purpose: group admins manage servers, never the owner's token
const projectListSelect = Prisma.validator<Prisma.HetznerProjectsSelect>()({
  id: true,
  name: true,
  createdAt: true,
  owner: { select: { id: true, nickName: true } },
  groupHetznerProjects: {
    where: { group: { deletedAt: null } },
    select: { group: { select: { id: true, name: true } } },
  },
});

export type HetznerProjectListItem = Prisma.HetznerProjectsGetPayload<{
  select: typeof projectListSelect;
}>;

export async function getHetznerProjectsPaginated(
  pagination: PaginationState,
  sorting: { field: string; order: "asc" | "desc" },
  filter?: string,
): Promise<ServerResponse<PaginationResponse<HetznerProjectListItem>>> {
  return doServerActionWithAuth(
    ["hetzner:view", "hetzner:create", "hetzner::moderator", "hetzner::admin"],
    async (session) => {
      const db = getClient();

      const where: Prisma.HetznerProjectsWhereInput = {
        deletedAt: null,
        ...(filter && {
          OR: [{ name: { contains: filter } }],
        }),
      };

      if (
        !session.user.admin &&
        !session.user.permissions.includes("hetzner:view")
      ) {
        const userProjects = session.user.projects.map((p) => p.id);

        if (userProjects.length === 0) {
          return {
            totalCount: 0,
            data: [],
          };
        }

        where.id = { in: userProjects };
      }

      const totalCount = await db.hetznerProjects.count({
        where,
      });

      const projects = await db.hetznerProjects.findMany({
        where,
        select: projectListSelect,
        orderBy: { [sorting.field]: sorting.order },
        skip: pagination.pageIndex * pagination.pageSize,
        take: pagination.pageSize,
      });

      return { totalCount, data: projects };
    },
  );
}
