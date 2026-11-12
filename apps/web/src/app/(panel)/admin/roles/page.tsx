import { PaginationTable } from "@/components/table/pagination-table";
import { hasPermission } from "@/lib/auth";
import { routePermissions, routes } from "@/routes";
import { redirect } from "next/navigation";
import { createActions } from "./actions";
import { createColumns } from "./columns";

export default async function AdminRolesPage() {
  const canView = await hasPermission(routePermissions.admin.roles.view);
  if (!canView) {
    redirect(routes.dashboard);
  }

  const canCreate = await hasPermission(routePermissions.admin.roles.create);

  return (
    <div className="flex flex-col gap-6">
      <PaginationTable
        createColumns={createColumns}
        endpoint="/api/roles"
        actions={createActions}
        actionsAllowed={canCreate}
        filter
      />
    </div>
  );
}
