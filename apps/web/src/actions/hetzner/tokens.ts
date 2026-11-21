"use server";

import { withAudit } from "@/actions/database/server-only/audit-logs";
import { doServerActionWithAuth } from "@/lib/actions";
import { axiosHetzner } from "@/lib/axios/hetzner";
import { getClient } from "@/lib/dbclient";
import { encryptHetznerToken } from "@/lib/hetzner";
import { assertResourceId } from "@/lib/resource-id";
import { hasPermissionSync } from "@/lib/utils";
import { ServerError, ServerResponse } from "@/types/responses";
import { isAxiosError } from "axios";
import { Session } from "next-auth";
import { z } from "zod";

const tokenInput = z
  .object({
    name: z.string().trim().min(1).max(255),
    token: z.string().trim().min(1).max(500),
  })
  .strict();

const updateTokenInput = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    token: z.string().trim().min(1).max(500).optional(),
  })
  .strict();

const groupIdsInput = z.array(z.string().min(1).max(64)).max(100);

function parse<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new ServerError(
      parsed.error.issues.map((i) => i.message).join(", "),
      "ValidationError",
    );
  }
  return parsed.data;
}

// A token that can't list servers can't deploy any either, so reject it before saving
async function assertTokenWorks(token: string) {
  try {
    await axiosHetzner.get("/servers", {
      headers: { Authorization: `Bearer ${token}` },
      params: { per_page: 1 },
    });
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      throw new ServerError(
        "Hetzner rejected this API token",
        "HetznerTokenInvalid",
      );
    }
    throw new ServerError(
      "Couldn't reach Hetzner to check the API token",
      "HetznerTokenCheckFailed",
    );
  }
}

// Only the owner (or a super admin) may see the token's settings, replace it or share it
async function getOwnedProject(session: Session, projectId: string) {
  assertResourceId(projectId);
  const project = await getClient().hetznerProjects.findFirst({
    where: { id: projectId, deletedAt: null },
    select: {
      id: true,
      ownerId: true,
      groupHetznerProjects: { select: { groupId: true } },
    },
  });
  if (
    !project ||
    (project.ownerId !== session.user.id && !session.user.admin)
  ) {
    throw new ServerError("Hetzner token not found", "NotFound");
  }
  return project;
}

function canAdministerGroup(session: Session, groupId: string) {
  return hasPermissionSync(
    session,
    ["groups:edit", "groups:id:admin"],
    groupId,
  );
}

export async function addHetznerToken(input: {
  name: string;
  token: string;
}): Promise<ServerResponse<{ id: string }>> {
  return doServerActionWithAuth(["hetzner:create"], async (session) => {
    const data = parse(tokenInput, input);
    await assertTokenWorks(data.token);

    const project = await withAudit(
      (tx) =>
        tx.hetznerProjects.create({
          data: {
            name: data.name,
            apiTokens: [encryptHetznerToken(data.token)],
            ownerId: session.user.id,
          },
          select: { id: true },
        }),
      (project) => [
        session.user.id,
        project.id,
        "hetzner.project.create",
        { name: data.name },
      ],
    );
    return { id: project.id };
  });
}

export async function updateHetznerToken(
  projectId: string,
  input: { name?: string; token?: string },
): Promise<ServerResponse> {
  return doServerActionWithAuth([], async (session) => {
    const data = parse(updateTokenInput, input);
    await getOwnedProject(session, projectId);
    if (data.token) await assertTokenWorks(data.token);

    await withAudit(
      (tx) =>
        tx.hetznerProjects.update({
          where: { id: projectId },
          data: {
            name: data.name,
            ...(data.token && {
              apiTokens: [encryptHetznerToken(data.token)],
            }),
          },
        }),
      () => [
        session.user.id,
        projectId,
        "hetzner.project.edit",
        { name: data.name, tokenReplaced: !!data.token },
      ],
    );
  });
}

// Servers already running on Hetzner keep running; the panel just stops managing them
export async function deleteHetznerToken(
  projectId: string,
): Promise<ServerResponse> {
  return doServerActionWithAuth([], async (session) => {
    await getOwnedProject(session, projectId);

    await withAudit(
      async (tx) => {
        await tx.groupHetznerProjects.deleteMany({ where: { projectId } });
        return tx.hetznerProjects.update({
          where: { id: projectId },
          data: { deletedAt: new Date() },
        });
      },
      () => [session.user.id, projectId, "hetzner.project.delete"],
    );
  });
}

// The owner may unshare from any group, but only share with groups they administer
export async function setHetznerTokenGroups(
  projectId: string,
  groupIds: string[],
): Promise<ServerResponse> {
  return doServerActionWithAuth([], async (session) => {
    const wanted = [...new Set(parse(groupIdsInput, groupIds))];
    const project = await getOwnedProject(session, projectId);

    const current = project.groupHetznerProjects.map((g) => g.groupId);
    const added = wanted.filter((id) => !current.includes(id));
    const removed = current.filter((id) => !wanted.includes(id));

    if (added.some((id) => !canAdministerGroup(session, id))) {
      throw new ServerError(
        "You can only share a token with groups you administer",
        "Unauthorized",
      );
    }
    if (added.length > 0) {
      const existing = await getClient().groups.count({
        where: { id: { in: added }, deletedAt: null },
      });
      if (existing !== added.length) {
        throw new ServerError("Group not found", "NotFound");
      }
    }

    await withAudit(
      async (tx) => {
        await tx.groupHetznerProjects.deleteMany({
          where: { projectId, groupId: { in: removed } },
        });
        await tx.groupHetznerProjects.createMany({
          data: added.map((groupId) => ({ groupId, projectId })),
        });
      },
      () => [
        session.user.id,
        projectId,
        "hetzner.project.share",
        { added, removed },
      ],
    );
  });
}

// Group admins may drop a shared token from their group without owning it
export async function removeHetznerTokenFromGroup(
  projectId: string,
  groupId: string,
): Promise<ServerResponse> {
  return doServerActionWithAuth([], async (session) => {
    assertResourceId(projectId);
    assertResourceId(groupId);
    if (!canAdministerGroup(session, groupId)) {
      throw new ServerError(
        "You can only remove tokens from groups you administer",
        "Unauthorized",
      );
    }

    await withAudit(
      (tx) =>
        tx.groupHetznerProjects.deleteMany({ where: { projectId, groupId } }),
      () => [
        session.user.id,
        projectId,
        "hetzner.project.unshare",
        { groupId },
      ],
    );
  });
}
