import { apiRoute } from "@/lib/api-route";
import { getMyHetznerTokens } from "@/services/hetzner/tokens";

export const GET = apiRoute(() => {
  return getMyHetznerTokens();
});
