"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useServers } from "@/providers/servers-provider";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavAdminGroups from "./nav-admin-groups";
import NavGroups, { getServerGroup } from "./nav-groups";
import { useServerSwitcher } from "./server-switcher";

// Pages of the server picked in the switcher
function NavActiveServer() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { servers } = useServers();
  const { selectedId } = useServerSwitcher();

  const server = servers.find((s) => s.id === selectedId);
  if (!server) return null;

  const entry = getServerGroup(server, session, selectedId);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden select-none">
      <SidebarGroupContent>
        <SidebarMenu>
          {entry.items
            .filter((i) => i.auth || i.auth === undefined)
            .map((item) => {
              const disabled = !server.isConnected && item.needsConnection;
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.name}
                    isActive={pathname.startsWith(item.url)}
                    aria-disabled={disabled}
                  >
                    {disabled ? (
                      <div>
                        <item.icon />
                        <span>{item.name}</span>
                      </div>
                    ) : (
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default function ServerNav({
  showAdminGroups,
}: {
  showAdminGroups: boolean;
}) {
  const { open } = useServerSwitcher();
  const { servers, loading } = useServers();
  // Nothing to pick from when the user has no servers
  const showList = open && (loading || servers.length > 0);

  // List stays mounted so group order and collapse state survive toggling
  return (
    <>
      <div className={cn(!showList && "hidden")}>
        <NavGroups />
        {showAdminGroups && (
          <>
            <SidebarSeparator />
            <NavAdminGroups />
          </>
        )}
        <SidebarSeparator />
      </div>
      <NavActiveServer />
    </>
  );
}
