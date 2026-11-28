"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getCurrentId, hasPermissionSync } from "@/lib/utils";
import { useServers } from "@/providers/servers-provider";
import { routePermissions, routes } from "@/routes";
import { IconPlus, IconServer, IconServerOff } from "@tabler/icons-react";
import { ChevronsUpDown } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface ServerSwitcherContextType {
  open: boolean;
  toggle: () => void;
  // Server shown in the switcher; stays set on non-server pages
  selectedId: string | null;
  select: (url: string) => void;
}

const ServerSwitcherContext = createContext<ServerSwitcherContextType | null>(
  null,
);

export const useServerSwitcher = () => {
  const ctx = useContext(ServerSwitcherContext);
  if (!ctx) {
    throw new Error(
      "useServerSwitcher must be used within a ServerSwitcherProvider",
    );
  }
  return ctx;
};

export function ServerSwitcherProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const currentId = getCurrentId(pathname);

  // Start open only when no server is open yet, so there is something to pick
  const [open, setOpen] = useState(() => !currentId);
  const [lastId, setLastId] = useState(currentId);

  useEffect(() => {
    if (currentId) setLastId(currentId);
  }, [currentId]);

  const select = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  return (
    <ServerSwitcherContext.Provider
      value={{
        open,
        toggle: () => setOpen((o) => !o),
        selectedId: currentId ?? lastId,
        select,
      }}
    >
      {children}
    </ServerSwitcherContext.Provider>
  );
}

export function ServerSwitcher() {
  const { data: session } = useSession();
  const { servers, loading } = useServers();
  const { open, toggle, selectedId } = useServerSwitcher();

  if (!session) return null;

  // No accessible servers: point to the Servers page instead of a picker
  if (!loading && servers.length === 0) {
    if (!hasPermissionSync(session, routePermissions.admin.servers.view)) {
      return null;
    }

    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="select-none" asChild>
            <Link href={routes.admin.servers}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <IconPlus className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Setup server</span>
                <span className="truncate text-xs text-muted-foreground">
                  No servers yet
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const server = servers.find((s) => s.id === selectedId);
  const Icon = server && !server.isConnected ? IconServerOff : IconServer;

  let subtitle = `${servers.length} server${servers.length === 1 ? "" : "s"}`;
  if (loading) subtitle = "Loading...";
  else if (server) subtitle = server.isConnected ? "Online" : "Offline";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          onClick={toggle}
          aria-expanded={open}
          data-state={open ? "open" : "closed"}
          className="cursor-pointer select-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Icon className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {server?.name ?? "Select a server"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {subtitle}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
