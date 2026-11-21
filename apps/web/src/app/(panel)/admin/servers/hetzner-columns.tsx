/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { useHetznerServerLinks } from "@/hooks/use-hetzner-queries";
import { parseTmTags } from "@/lib/tmtags";
import type { HetznerProjectListItem } from "@/services/database/hetzner-projects";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import HetznerProjectActionsMenu from "./hetzner-project-actions-menu";

export const createHetznerColumns = (
  refetch: () => void,
): ColumnDef<HetznerProjectListItem>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
  },
  {
    id: "owner",
    header: "Owner",
    cell: ({ row }) =>
      row.original.owner ? (
        <span
          dangerouslySetInnerHTML={{
            __html: parseTmTags(row.original.owner.nickName),
          }}
        />
      ) : (
        <span className="text-muted-foreground">No owner</span>
      ),
  },
  {
    id: "servers",
    header: "Servers",
    cell: ({ row }) => {
      const { data: session } = useSession();
      const isMember = session?.user.projects.some(
        (p) => p.id === row.original.id,
      );
      // Shares the server table's cached query; only covers your own projects
      const links = useHetznerServerLinks(!!isMember);
      if (!isMember || !links.data) return null;
      if (links.data.errors.some((e) => e.projectId === row.original.id)) {
        return <span className="text-destructive">Couldn&apos;t load</span>;
      }
      const servers = links.data.servers.filter(
        (s) => s.projectId === row.original.id,
      );
      const running = servers.filter((s) => s.status === "running").length;
      return (
        <span>
          {running} running · {servers.length} total
        </span>
      );
    },
  },
  {
    id: "groups",
    header: "Shared with",
    cell: ({ row }) => {
      const groups = row.original.groupHetznerProjects.map((g) => g.group);
      if (groups.length === 0) {
        return <span className="text-muted-foreground">No groups</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {groups.map((g) => (
            <Badge key={g.id} variant="outline">
              {g.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "access",
    header: "Your access",
    cell: ({ row }) => {
      const { data: session } = useSession();
      const project = row.original;
      const role =
        project.owner?.id === session?.user.id
          ? "Owner"
          : session?.user.projects.find((p) => p.id === project.id)?.role;
      return role ? <Badge variant="secondary">{role}</Badge> : null;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <HetznerProjectActionsMenu project={row.original} refetch={refetch} />
      </div>
    ),
  },
];
