"use client";

import { getDisplayNamesByLogins } from "@/lib/api-client/nadeo-names";
import { queryKeys, unwrap } from "@/lib/api-client/query";
import { useQuery } from "@tanstack/react-query";

const LOGIN = /^[A-Za-z0-9_-]{22}$/;
const BATCH = 200;

// Nadeo display names by login; names rarely change, so they are kept for the session
export function useDisplayNames(logins: string[]) {
  const unique = [
    ...new Set(logins.filter((login) => LOGIN.test(login))),
  ].sort();
  return useQuery({
    queryKey: queryKeys.displayNames(unique),
    queryFn: async ({ signal }) => {
      const batches = [];
      for (let i = 0; i < unique.length; i += BATCH)
        batches.push(
          unwrap(
            getDisplayNamesByLogins(unique.slice(i, i + BATCH), signal),
            "GetDisplayNamesError",
          ),
        );
      return Object.assign({}, ...(await Promise.all(batches))) as Record<
        string,
        string
      >;
    },
    enabled: unique.length > 0,
    staleTime: Infinity,
    placeholderData: (previous) => previous,
  });
}
