import { apiRoute } from "@/lib/api-route";
import { getHetznerServerLinks } from "@/services/hetzner/server-links";

export const GET = apiRoute(() => {
  return getHetznerServerLinks();
});
