import { PaginationTable } from "@/components/table/pagination-table";
import { hasPermission } from "@/lib/auth";
import { routePermissions, routes } from "@/routes";
import { redirect } from "next/navigation";
import { createActions } from "./actions";
import { createColumns } from "./columns";

export default async function AdminHetznerPage() {
  const canView = await hasPermission(routePermissions.admin.hetzner.view);
  if (!canView) {
    redirect(routes.dashboard);
  }

  const canCreate = await hasPermission(routePermissions.admin.hetzner.create);

  return (
    <div className="flex flex-col gap-6">
      <PaginationTable
        endpoint="/api/hetzner/projects"
        createColumns={createColumns}
        actions={createActions}
        actionsAllowed={canCreate}
        filter
      />
    </div>
  );
}
