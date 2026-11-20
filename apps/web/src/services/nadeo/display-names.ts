import { doServerActionWithAuth } from "@/lib/actions";
import { getAccountNames } from "@/lib/api/nadeo";
import { ServerResponse } from "@/types/responses";
import "server-only";
import slugid from "slugid";

// Nadeo display names of player logins, for people who never signed in to the panel.
// Same roles as the panel's user lookups: whoever can pick players in a form.
export async function getDisplayNamesByLogins(
  logins: string[],
): Promise<ServerResponse<Record<string, string>>> {
  return doServerActionWithAuth(
    [
      "groups:create",
      "groups:edit",
      "groups::admin",
      "servers:create",
      "servers:edit",
      "servers::admin",
      "group:servers::admin",
      "hetzner:create",
      "hetzner:edit",
      "hetzner::admin",
    ],
    async () => {
      // A login is the account id's UUID in URL-safe base64
      const accounts = new Map(
        logins.map((login) => [slugid.decode(login), login]),
      );
      const names = await getAccountNames([...accounts.keys()]);
      const result: Record<string, string> = {};
      for (const [accountId, name] of Object.entries(names)) {
        const login = accounts.get(accountId);
        if (login && name) result[login] = name;
      }
      return result;
    },
  );
}
