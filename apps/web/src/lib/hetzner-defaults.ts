import type { HetznerServerType } from "@/types/api/hetzner/servers";

// Preferred defaults in order; cx23 is not sold in every location
const PREFERRED_SERVER_TYPES = ["cx23", "cpx22", "cpx11"];

export function defaultServerTypeId(
  serverTypes: HetznerServerType[],
  location?: string,
): string {
  const available = location
    ? serverTypes.filter((t) => t.prices.some((p) => p.location === location))
    : serverTypes;
  const pool = available.length > 0 ? available : serverTypes;
  for (const name of PREFERRED_SERVER_TYPES) {
    const match = pool.find((t) => t.name === name);
    if (match) return match.id.toString();
  }
  return pool[0]?.id.toString() ?? "";
}

// Turns a dedicated server login into a valid Hetzner server name
export function serverNameFromLogin(login: string): string {
  const name = login
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/, "");
  return name || "trackmania-server";
}
