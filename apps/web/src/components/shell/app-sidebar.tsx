import * as React from "react";

import { BrandMark } from "@/components/brand-mark";
import Navbar from "@/components/shell/navbar";
import {
  ServerSwitcher,
  ServerSwitcherProvider,
} from "@/components/shell/navbar/server-switcher";
import { SiteUser } from "@/components/shell/site-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <ServerSwitcherProvider>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 p-2 select-none">
                <BrandMark className="size-7 shrink-0" />
                <span className="text-base font-semibold">TMControlPanel</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
          <ServerSwitcher />
        </SidebarHeader>
        <SidebarContent className="overflow-x-hidden">
          <Navbar />
        </SidebarContent>
        <SidebarFooter>
          <SiteUser />
        </SidebarFooter>
      </ServerSwitcherProvider>
    </Sidebar>
  );
}
