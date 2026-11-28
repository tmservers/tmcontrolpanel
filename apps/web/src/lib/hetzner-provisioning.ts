import type { HetznerServer } from "@/types/api/hetzner/servers";

export type ProvisioningStage =
  | "creating"
  | "booting"
  | "installing"
  | "connected"
  | "failed";

export interface ProvisioningStatus {
  stage: ProvisioningStage;
  hetznerStatus: HetznerServer["status"];
  ip: string | null;
  serverType: string;
  createdAt: string;
  // Null when no panel server is linked to this machine
  panelConnected: boolean | null;
}

// Maps the Hetzner machine state and panel connection onto the wizard's stages
export function provisioningStage(
  hetznerStatus: HetznerServer["status"],
  panelConnected: boolean | null,
): ProvisioningStage {
  switch (hetznerStatus) {
    case "initializing":
      return "creating";
    case "starting":
    case "off":
    case "rebuilding":
    case "migrating":
      return "booting";
    case "running":
      return panelConnected ? "connected" : "installing";
    default:
      return "failed";
  }
}
