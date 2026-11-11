"use server";

import { doServerActionWithAuth } from "@/lib/actions";
import { disconnectTmevents as disconnect } from "@/lib/tmevents/oauth";
import { ServerResponse } from "@/types/responses";

// Unlinks the signed-in user's own Trackmania Events account
export async function disconnectTmevents(): Promise<ServerResponse> {
  return doServerActionWithAuth([], async (session) => {
    await disconnect(session.user.id);
  });
}
