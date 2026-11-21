/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { useHetznerServerLinks } from "@/hooks/use-hetzner-queries";
import { findHetznerServer, HETZNER_STATUS_VARIANT } from "@/lib/hetzner-link";
import { useServers } from "@/providers/servers-provider";
import type { ServersWithUsers } from "@/services/database/servers";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useState } from "react";
import ServerActionsMenu from "./server-actions-menu";

export const createColumns = (
  refetch: () => void,
): ColumnDef<ServersWithUsers>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const { servers } = useServers();
      const live = servers.find((s) => s.id === row.original.id);
      // Only servers the user can open are in the live list
      if (!live) return null;
      return live.isConnected ? (
        <Badge>Online</Badge>
      ) : (
        <Badge variant="secondary">Offline</Badge>
      );
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
  },
  {
    id: "address",
    header: "Address",
    cell: ({ row }) => (
      <span>
        {row.original.host}:{row.original.port}
      </span>
    ),
  },
  {
    id: "hetzner",
    header: "Hetzner",
    cell: ({ row }) => {
      const { data: session } = useSession();
      // Shares the cached query, so each row doesn't call Hetzner again
      const links = useHetznerServerLinks(
        (session?.user.projects.length ?? 0) > 0,
      );
      const server =
        links.data && findHetznerServer(row.original.host, links.data.servers);
      if (!server) return null;
      return (
        <div className="flex items-center gap-2">
          <span className="truncate">{server.name}</span>
          <Badge variant={HETZNER_STATUS_VARIANT[server.status]}>
            {server.status}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "filemanagerUrl",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="File Manager Url" />
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return (
        <span>
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [editIsOpen, setEditIsOpen] = useState(false);
      return (
        <div className="flex justify-end">
          <ServerActionsMenu
            server={row.original}
            refetch={refetch}
            editIsOpen={editIsOpen}
            setEditIsOpen={setEditIsOpen}
          />
        </div>
      );
    },
  },
];
