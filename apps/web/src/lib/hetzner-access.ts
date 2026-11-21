import type { GroupRole, HetznerProjectRole } from "@tmcontrolpanel/db";

interface ProjectRef {
  id: string;
  name: string;
}

export interface ProjectAccess extends ProjectRef {
  role: HetznerProjectRole;
}

// Group Admins manage a shared project's servers, Moderators view them, Members get nothing
const GROUP_ROLE_TO_PROJECT_ROLE: Record<GroupRole, HetznerProjectRole | null> =
  {
    Admin: "Admin",
    Moderator: "Moderator",
    Member: null,
  };

// Prisma select for the projects a user reaches through ownership and groups
export const hetznerAccessSelect = {
  ownedHetznerProjects: {
    where: { deletedAt: null },
    select: { id: true, name: true },
  },
} as const;

export const groupHetznerProjectsSelect = {
  groupHetznerProjects: {
    where: { project: { deletedAt: null } },
    select: { project: { select: { id: true, name: true } } },
  },
} as const;

// Direct memberships, owned tokens and group shares; the highest role per project wins
export function mergeHetznerProjectAccess({
  direct,
  owned,
  groups,
}: {
  direct: ProjectAccess[];
  owned: ProjectRef[];
  groups: { role: GroupRole; projects: ProjectRef[] }[];
}): ProjectAccess[] {
  const byId = new Map<string, ProjectAccess>();

  const add = (project: ProjectRef, role: HetznerProjectRole) => {
    const current = byId.get(project.id);
    if (!current || (current.role === "Moderator" && role === "Admin")) {
      byId.set(project.id, { id: project.id, name: project.name, role });
    }
  };

  direct.forEach((p) => add(p, p.role));
  owned.forEach((p) => add(p, "Admin"));
  groups.forEach((group) => {
    const role = GROUP_ROLE_TO_PROJECT_ROLE[group.role];
    if (role) group.projects.forEach((p) => add(p, role));
  });

  return [...byId.values()];
}
