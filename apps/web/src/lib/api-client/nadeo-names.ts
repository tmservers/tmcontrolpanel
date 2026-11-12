import type * as Names from "@/services/nadeo/display-names";
import { apiGet } from "./http";

export const getDisplayNamesByLogins = (
  logins: string[],
  signal?: AbortSignal,
): ReturnType<typeof Names.getDisplayNamesByLogins> =>
  apiGet("/api/nadeo/display-names", { logins }, { signal });
