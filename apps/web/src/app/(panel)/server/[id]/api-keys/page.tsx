import { ServerApiKeys } from "@/components/api-keys/api-keys-panel";
import { hasPermission } from "@/lib/auth";
import { routePermissions, routes } from "@/routes";
import { redirect } from "next/navigation";

export default async function ServerApiKeysPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const canView = await hasPermission(routePermissions.servers.apiKeys, id);
  if (!canView) {
    redirect(routes.dashboard);
  }

  return (
    <div className="flex flex-col gap-6">
      <ServerApiKeys serverId={id} />
    </div>
  );
}
