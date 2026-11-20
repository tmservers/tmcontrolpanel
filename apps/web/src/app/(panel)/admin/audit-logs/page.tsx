import { PaginationTable } from "@/components/table/pagination-table";
import { hasPermission } from "@/lib/auth";
import { routePermissions, routes } from "@/routes";
import { redirect } from "next/navigation";
import { createColumns } from "./columns";

export default async function AdminAuditLogsPage() {
  const canView = await hasPermission(routePermissions.admin.auditLogs.view);
  if (!canView) {
    redirect(routes.dashboard);
  }

  return (
    <div className="flex flex-col gap-6">
      <PaginationTable
        createColumns={createColumns}
        endpoint="/api/audit-logs"
        filter
      />
    </div>
  );
}
