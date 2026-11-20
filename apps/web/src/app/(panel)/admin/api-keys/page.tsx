import { PaginationTable } from "@/components/table/pagination-table";
import { hasPermission } from "@/lib/auth";
import { routePermissions, routes } from "@/routes";
import { redirect } from "next/navigation";
import { createColumns, createReadOnlyColumns } from "./columns";

export default async function AdminApiKeysPage() {
  const canView = await hasPermission(routePermissions.admin.apiKeys.view);
  if (!canView) {
    redirect(routes.dashboard);
  }

  const canRevoke = await hasPermission(routePermissions.admin.apiKeys.revoke);

  return (
    <div className="flex flex-col gap-6">
      <PaginationTable
        createColumns={canRevoke ? createColumns : createReadOnlyColumns}
        endpoint="/api/api-keys"
        filter
      />
    </div>
  );
}
