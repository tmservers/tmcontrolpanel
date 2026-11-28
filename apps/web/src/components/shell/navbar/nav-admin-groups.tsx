"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useServers } from "@/providers/servers-provider";
import { IconServer } from "@tabler/icons-react";
import { ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { getServerGroup, ServerNavGroup } from "./nav-groups";
import { ServerSelectItem } from "./server-select-item";

export default function NavAdminGroups() {
  const { data: session } = useSession();

  const { servers, serverId } = useServers();

  const adminGroupsSidebarGroup: ServerNavGroup[] = useMemo(
    () =>
      session?.user.adminGroups.map((group) => ({
        id: group.id,
        name: group.name,
        servers: servers
          .filter((server) => group.servers.some((s) => s.id === server.id))
          .map((server) => getServerGroup(server, session, serverId))
          .filter((server): server is NonNullable<typeof server> => !!server),
      })) || [],
    [session?.user.adminGroups, servers, serverId],
  );

  return adminGroupsSidebarGroup.map((group, index) => (
    <SidebarGroup
      className="group-data-[collapsible=icon]:hidden select-none py-1"
      key={index}
    >
      <Collapsible
        defaultOpen={group.servers.some((server) => server.isActive)}
        className="group/collapsible"
      >
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start gap-2 text-left text-xs font-normal"
            >
              <span>{group.name}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </Button>
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
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
                  <ServerSelectItem key={server.id} server={server} />
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  ));
}
