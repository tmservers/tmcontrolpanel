import PanelCodriver from "@/components/codriver/panel-codriver";
import { Badge } from "@/components/ui/badge";
import { hasPermission } from "@/lib/auth";
import { routePermissions, routes } from "@/routes";
import { redirect } from "next/navigation";

export default async function AdminCodriverPage() {
  if (!(await hasPermission(routePermissions.admin.codriver.view))) {
    redirect(routes.dashboard);
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">Experimental</Badge>
        Codriver can make mistakes.
      </p>
      <PanelCodriver />
    </div>
  );
}
