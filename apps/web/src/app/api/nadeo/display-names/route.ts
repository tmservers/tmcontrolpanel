import { apiRoute, parseQuery, stringList } from "@/lib/api-route";
import { getDisplayNamesByLogins } from "@/services/nadeo/display-names";
import { z } from "zod";

export const GET = apiRoute(async ({ query }) => {
  const q = parseQuery(
    query,
    z.object({
      logins: stringList.pipe(
        z.array(z.string().regex(/^[A-Za-z0-9_-]{22}$/)).max(200),
      ),
    }),
  );
  return getDisplayNamesByLogins(q.logins);
});
