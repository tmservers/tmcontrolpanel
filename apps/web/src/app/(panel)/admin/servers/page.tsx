import { PaginationTable } from "@/components/table/pagination-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth, hasPermission } from "@/lib/auth";
import { routePermissions, routes } from "@/routes";
import { getRecentlyCreatedHetznerServers } from "@/services/hetzner/servers";
import { redirect } from "next/navigation";
import { createActions } from "./actions";
import AdminClusterPage from "./cluster";
import { createColumns } from "./columns";
import { createHetznerActions } from "./hetzner-actions";
import { createHetznerColumns } from "./hetzner-columns";

const TABS = ["servers", "hetzner", "cluster"] as const;
type Tab = (typeof TABS)[number];

export default async function AdminServersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const canViewServers = await hasPermission(
    routePermissions.admin.servers.view,
  );
  const canViewHetzner = await hasPermission(
    routePermissions.admin.hetzner.view,
  );
  if (!canViewServers && !canViewHetzner) {
    redirect(routes.dashboard);
  }

  const session = await auth();
  const canViewCluster = session?.user.admin === true;

  const visible: Record<Tab, boolean> = {
    servers: canViewServers,
    hetzner: canViewHetzner,
    cluster: canViewCluster,
  };
  const { tab } = await searchParams;
  const defaultTab =
    TABS.find((t) => t === tab && visible[t]) ??
    TABS.find((t) => visible[t]) ??
    "servers";

  const [canCreateServer, canCreateProject, canManageCluster] =
    await Promise.all([
      hasPermission(routePermissions.admin.servers.create),
      hasPermission(routePermissions.admin.hetzner.create),
      hasPermission(routePermissions.admin.servers.clients.manage),
    ]);
  const canDeploy =
    (session?.user.projects.some((p) => p.role === "Admin") ?? false) ||
    canCreateProject;

  const recentlyCreatedServers = canViewServers
    ? (await getRecentlyCreatedHetznerServers()).data
    : [];

  const serversTable = (
    <PaginationTable
      createColumns={createColumns}
      endpoint="/api/servers"
      actions={createActions}
      actionsAllowed={canCreateServer || canDeploy}
      actionsArgs={{
        recentlyCreatedServers,
        canCreateServer,
        canDeploy,
        canAddToken: canCreateProject,
      }}
      filter
    />
  );

  const hetznerTable = (
    <PaginationTable
      endpoint="/api/hetzner/projects"
      createColumns={createHetznerColumns}
      actions={createHetznerActions}
      actionsAllowed={canCreateProject}
      filter
    />
  );

  const tabCount = Object.values(visible).filter(Boolean).length;
  if (tabCount === 1) {
    return (
      <div className="flex flex-col gap-6">
        {canViewServers ? serversTable : hetznerTable}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full">
          {canViewServers && <TabsTrigger value="servers">Servers</TabsTrigger>}
          {canViewHetzner && (
            <TabsTrigger value="hetzner">Hetzner Cloud</TabsTrigger>
          )}
          {canViewCluster && <TabsTrigger value="cluster">Cluster</TabsTrigger>}
        </TabsList>

        {canViewServers && (
          <TabsContent value="servers">{serversTable}</TabsContent>
        )}

        {canViewHetzner && (
          <TabsContent value="hetzner">{hetznerTable}</TabsContent>
        )}

        {canViewCluster && (
          <TabsContent value="cluster">
            <AdminClusterPage canManage={canManageCluster} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
