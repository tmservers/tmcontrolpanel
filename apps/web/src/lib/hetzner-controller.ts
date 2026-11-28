// MiniControl's worldrecords plugin exits the whole controller without API credentials
const WORLD_RECORDS_PLUGIN = "tm2020/worldrecords";

export function controllerForProvisioning<
  T extends {
    type: string;
    identifier?: string;
    secret?: string;
    excludedPlugins?: string[];
  },
>(controller: T | undefined): T | undefined {
  if (!controller || controller.type !== "minicontrol") return controller;
  if (controller.identifier?.trim() && controller.secret?.trim())
    return controller;

  const excluded = controller.excludedPlugins ?? [];
  if (excluded.includes(WORLD_RECORDS_PLUGIN)) return controller;
  return {
    ...controller,
    excludedPlugins: [...excluded, WORLD_RECORDS_PLUGIN],
  };
}
