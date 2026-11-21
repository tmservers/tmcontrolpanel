import type { HetznerServer } from "@/types/api/hetzner/servers";

// Cloud server fields safe for any project member; labels hold credentials and are left out
export interface LinkedHetznerServer {
  id: number;
  projectId: string;
  projectName: string;
  name: string;
  status: HetznerServer["status"];
  type: string;
  cores: number;
  memory: number;
  disk: number;
  location: string;
  country: string;
  ipv4: string | null;
  privateIps: string[];
  created: string;
}

export interface HetznerServerLinks {
  servers: LinkedHetznerServer[];
  // Projects that failed to load, so the UI can say why a link is missing
  errors: { projectId: string; projectName: string; error: string }[];
}

export function toLinkedHetznerServer(
  server: HetznerServer,
  project: { id: string; name: string },
): LinkedHetznerServer {
  return {
    id: server.id,
    projectId: project.id,
    projectName: project.name,
    name: server.name,
    status: server.status,
    type: server.server_type.name,
    cores: server.server_type.cores,
    memory: server.server_type.memory,
    disk: server.server_type.disk,
    location: server.location.city || server.location.name,
    country: server.location.country,
    ipv4: server.public_net.ipv4?.ip ?? null,
    privateIps: server.private_net
      .map((net) => net.ip)
      .filter((ip): ip is string => !!ip),
    created: server.created,
  };
}

// Panel servers have no cloud server ID; provisioning stores the cloud IP as the host
export function findHetznerServer(
  host: string,
  servers: LinkedHetznerServer[],
): LinkedHetznerServer | undefined {
  const normalized = host.trim().toLowerCase();
  if (!normalized) return undefined;

  return (
    servers.find((s) => s.ipv4 === normalized) ??
    servers.find((s) => s.privateIps.includes(normalized))
  );
}

export const HETZNER_STATUS_VARIANT: Record<
  HetznerServer["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  running: "default",
  off: "secondary",
  initializing: "outline",
  starting: "outline",
  stopping: "outline",
  migrating: "outline",
  rebuilding: "outline",
  deleting: "destructive",
  unknown: "destructive",
};
