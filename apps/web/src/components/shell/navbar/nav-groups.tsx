"use client";
import {
  updateGroupOrder,
  updateGroupServersOrder,
} from "@/actions/database/groups";
import IconNadeo from "@/components/icons/nadeo";
import IconTmx from "@/components/icons/tmx-svg";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { generatePath, getErrorMessage, hasPermissionSync } from "@/lib/utils";
import { useServers } from "@/providers/servers-provider";
import { connectionRoutes, routePermissions, routes } from "@/routes";
import { UserGroup } from "@/types/auth";
import { ServerError } from "@/types/responses";
import {
  IconActivity,
  IconAdjustmentsAlt,
  IconChevronDown,
  IconChevronUp,
  IconDeviceDesktop,
  IconDeviceGamepad,
  IconFileDescription,
  IconKey,
  IconMap,
  IconRobot,
  IconServer,
  IconServerOff,
  IconSettings,
  IconStopwatch,
  IconUsers,
} from "@tabler/icons-react";
import { ServerInfo } from "@tmcontrolpanel/shared";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ServerSelectItem } from "./server-select-item";

export interface ServerNavGroup {
  id: string;
  name: string;
  servers: {
    id: string;
    name: string;
    isConnected: boolean;
    isActive: boolean;
    icon?: React.ElementType;
    items?: {
      name: string;
      url: string;
      icon?: React.ElementType;
      auth?: boolean;
      needsConnection?: boolean;
    }[];
  }[];
}

export function getServerGroup(
  server: ServerInfo,
  session: Session | null,
  serverId: string | null,
) {
  const serverGroup = {
    id: server.id,
    name: server.name,
    isConnected: server.isConnected,
    icon: server.isConnected ? IconServer : IconServerOff,
    isActive: serverId === server.id,
    items: [
      {
        name: "Settings",
        url: generatePath(routes.servers.settings, {
          id: server.id,
        }),
        icon: IconAdjustmentsAlt,
        auth: hasPermissionSync(
          session,
          routePermissions.servers.settings,
          server.id,
        ),
        needsConnection: connectionRoutes.includes(routes.servers.settings),
      },
      {
        name: "Game",
        url: generatePath(routes.servers.game, {
          id: server.id,
        }),
        icon: IconDeviceGamepad,
        needsConnection: connectionRoutes.includes(routes.servers.game),
      },
      {
        name: "Maps",
        url: generatePath(routes.servers.maps, {
          id: server.id,
        }),
        icon: IconMap,
        auth: hasPermissionSync(
          session,
          routePermissions.servers.maps,
          server.id,
        ),
        needsConnection: connectionRoutes.includes(routes.servers.maps),
      },
      {
        name: "Players",
        url: generatePath(routes.servers.players, {
          id: server.id,
        }),
        icon: IconUsers,
        auth: hasPermissionSync(
          session,
          routePermissions.servers.players,
          server.id,
        ),
        needsConnection: connectionRoutes.includes(routes.servers.players),
      },
      {
        name: "Live",
        url: generatePath(routes.servers.live, {
          id: server.id,
        }),
        icon: IconActivity,
        needsConnection: connectionRoutes.includes(routes.servers.live),
      },
      {
        name: "Records",
        url: generatePath(routes.servers.records, {
          id: server.id,
        }),
        icon: IconStopwatch,
        needsConnection: connectionRoutes.includes(routes.servers.records),
      },
      {
        name: "Plugins",
        url: generatePath(routes.servers.plugins, {
          id: server.id,
        }),
        icon: IconDeviceDesktop,
        auth: hasPermissionSync(
          session,
          routePermissions.servers.plugins,
          server.id,
        ),
        needsConnection: connectionRoutes.includes(routes.servers.plugins),
      },
      {
        name: "TMX",
        url: generatePath(routes.servers.tmx, {
          id: server.id,
        }),
        icon: IconTmx,
        auth: hasPermissionSync(
          session,
          routePermissions.servers.tmx,
          server.id,
        ),
        needsConnection: connectionRoutes.includes(routes.servers.tmx),
      },
      {
        name: "Nadeo",
        url: generatePath(routes.servers.nadeo, {
          id: server.id,
        }),
        icon: IconNadeo,
        auth: hasPermissionSync(
          session,
          routePermissions.servers.nadeo,
          server.id,
        ),
        needsConnection: connectionRoutes.includes(routes.servers.nadeo),
      },
      {
        name: "Advanced",
        url: generatePath(routes.servers.advanced, {
          id: server.id,
        }),
        icon: IconSettings,
        auth: hasPermissionSync(
          session,
          routePermissions.servers.advanced,
          server.id,
        ),
        needsConnection: connectionRoutes.includes(routes.servers.advanced),
      },
      {
        name: "Codriver",
        url: generatePath(routes.servers.codriver, {
          id: server.id,
        }),
        icon: IconRobot,
        auth: hasPermissionSync(
          session,
          routePermissions.servers.codriver,
          server.id,
        ),
        needsConnection: false,
      },
      {
        name: "API Keys",
        url: generatePath(routes.servers.apiKeys, {
          id: server.id,
        }),
        icon: IconKey,
        auth: hasPermissionSync(
          session,
          routePermissions.servers.apiKeys,
          server.id,
        ),
        needsConnection: false,
      },
    ],
  };

  if (server.hasFileManager) {
    serverGroup.items.push({
      name: "Files",
      url: generatePath(routes.servers.files, {
        id: server.id,
      }),
      icon: IconFileDescription,
      auth: hasPermissionSync(
        session,
        routePermissions.servers.files,
        server.id,
      ),
      needsConnection: connectionRoutes.includes(routes.servers.files),
    });
  }

  return serverGroup;
}

export default function NavGroups() {
  const { data: session } = useSession();

  const { servers, serverId, loading } = useServers();

  const [groups, setGroups] = useState<UserGroup[]>([]);

  useEffect(() => {
    setGroups(session?.user.groups || []);
  }, [session?.user.groups]);

  const groupsSidebarGroup: ServerNavGroup[] = useMemo(
    () =>
      groups.map((group) => ({
        id: group.id,
        name: group.name,
        servers: servers
          .filter((server) => group.servers.some((s) => s.id === server.id))
          .sort((a, b) => {
            // If no serversOrder, sort by name
            if (!group.serversOrder) {
              return a.name.localeCompare(b.name);
            }

            // Sort servers based on serversOrder in the group, if not found (-1), sort by name
            const indexA = group.serversOrder.findIndex((s) => s === a.id);
            const indexB = group.serversOrder.findIndex((s) => s === b.id);

            if (indexA === -1 && indexB === -1) {
              return a.name.localeCompare(b.name);
            }
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;

            return indexA - indexB;
          })
          .map((server) => getServerGroup(server, session, serverId))
          .filter((server): server is NonNullable<typeof server> => !!server),
      })) || [],
    [groups, servers, serverId],
  );

  const saveGroupOrder = async (updatedGroups: UserGroup[]) => {
    try {
      const { error } = await updateGroupOrder(updatedGroups);
      if (error) {
        throw new ServerError(error, "UpdateGroupOrderError");
      }
    } catch (error) {
      toast.error("Failed to update group order", {
        description: getErrorMessage(error),
      });
    }
  };

  const saveGroupServersOrder = async (
    groupId: string,
    serversOrder: string[],
  ) => {
    try {
      const { error } = await updateGroupServersOrder(groupId, serversOrder);
      if (error) {
        throw new ServerError(error, "UpdateGroupServersOrderError");
      }
    } catch (error) {
      toast.error("Failed to update server order", {
        description: getErrorMessage(error),
      });
    }
  };

  const moveGroup = (id: string, direction: "up" | "down") => {
    const sorted = [...groups];
    const index = sorted.findIndex((g) => g.id === id);

    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    [sorted[index], sorted[targetIndex]] = [sorted[targetIndex], sorted[index]];

    const normalized = sorted.map((g, i) => ({
      ...g,
      order: i,
    }));

    setGroups(normalized);
    saveGroupOrder(normalized);
  };

  const moveServer = (
    groupId: string,
    serverId: string,
    direction: "up" | "down",
  ) => {
    const groupIndex = groups.findIndex((g) => g.id === groupId);
    if (groupIndex === -1) return;

    const group = groups[groupIndex];
    const serversOrder = group.serversOrder || group.servers.map((s) => s.id);
    const index = serversOrder.findIndex((id) => id === serverId);

    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= serversOrder.length) return;

    [serversOrder[index], serversOrder[targetIndex]] = [
      serversOrder[targetIndex],
      serversOrder[index],
    ];

    const updatedGroups = [...groups];
    updatedGroups[groupIndex] = {
      ...group,
      serversOrder,
    };

    setGroups(updatedGroups);
    saveGroupServersOrder(groupId, serversOrder);
  };

  if (loading) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden select-none">
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconServer />
                  <span>Loading...</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (groupsSidebarGroup.length === 0) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden select-none">
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>No groups found</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return groupsSidebarGroup.map((group, index) => (
    <SidebarGroup
      className="group-data-[collapsible=icon]:hidden select-none"
      key={index}
    >
      <SidebarGroupLabel className="flex items-center justify-between">
        <span>{group.name}</span>
        <div className="flex items-center gap-1">
          <Button
            size="sidebar"
            variant="ghost"
            onClick={() => moveGroup(group.id, "up")}
          >
            <IconChevronUp className="w-4 h-4" />
          </Button>
          <Button
            size="sidebar"
            variant="ghost"
            onClick={() => moveGroup(group.id, "down")}
          >
            <IconChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {group.servers.length === 0 ? (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconServer />
                  <span>No servers in this group</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            group.servers.map((server) => (
              <ServerSelectItem
                key={server.id}
                server={server}
                onMove={(direction) =>
                  moveServer(group.id, server.id, direction)
                }
              />
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ));
}
