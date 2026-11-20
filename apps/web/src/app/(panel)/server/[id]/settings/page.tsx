import { Card } from "@/components/ui/card";
import SettingsForm from "@/forms/server/settings/settings-form";
import { hasPermission } from "@/lib/auth";
import { routePermissions, routes } from "@/routes";
import { redirect } from "next/navigation";

export default async function ServerSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const canView = await hasPermission(routePermissions.servers.settings, id);

  if (!canView) {
    redirect(routes.dashboard);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <SettingsForm serverId={id} />
      </Card>
    </div>
  );
}
