"use client";

import { Button } from "@/components/ui/button";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useNotifications } from "@/providers/notification-provider";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import type { ServerNavGroup } from "./nav-groups";
import { useServerSwitcher } from "./server-switcher";

type ServerNavEntry = ServerNavGroup["servers"][number];

function availableItems(server: ServerNavEntry) {
  return (server.items ?? []).filter(
    (i) =>
      (i.auth || i.auth === undefined) &&
      !(i.needsConnection && !server.isConnected),
  );
}

// Same page on the new server when possible, otherwise its first available page
export function getServerTarget(
  server: ServerNavEntry,
  pathname: string,
): string | null {
  const items = availableItems(server);
  const page = pathname.match(/^\/server\/[^/]+\/([^/]+)/)?.[1];
  const match = page && items.find((i) => i.url.split("/")[3] === page);
  return match ? match.url : (items[0]?.url ?? null);
}

// Server row in the switcher list; clicking it opens the server and closes the list
export function ServerSelectItem({
  server,
  onMove,
}: {
  server: ServerNavEntry;
  onMove?: (direction: "up" | "down") => void;
}) {
  const pathname = usePathname();
  const { notifications } = useNotifications();
  const { select, selectedId } = useServerSwitcher();

  const target = getServerTarget(server, pathname);
  const unread = notifications.filter(
    (n) => n.serverId === server.id && !n.read,
  ).length;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={server.name}
        isActive={server.id === selectedId}
        asChild
      >
        <div
          role="button"
          tabIndex={target ? 0 : -1}
          aria-disabled={!target}
          onClick={() => target && select(target)}
          onKeyDown={(e) => {
            if (target && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              select(target);
            }
          }}
          className="group/item cursor-pointer select-none"
        >
          {server.icon && <server.icon />}
          <span className="flex items-center overflow-hidden text-nowrap text-ellipsis">
            {server.name}
            {unread > 0 && (
              <span className="ml-2 h-3 w-3 rounded-full bg-destructive text-center text-[8px]">
                {unread}
              </span>
            )}
          </span>
          {onMove && (
            <div className="ml-auto hidden items-end group-hover/item:flex">
              <Button
                size="sidebar"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove("up");
                }}
              >
                <IconChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="sidebar"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove("down");
                }}
              >
                <IconChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
