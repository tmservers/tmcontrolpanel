"use server";

import { doServerActionWithAuth } from "@/lib/actions";
import { actorFromSession } from "@/lib/actor";
import { assertResourceId } from "@/lib/resource-id";
import { addTmeventsMapsAs } from "@/lib/tmevents/maps";
import { disconnectTmevents as disconnect } from "@/lib/tmevents/oauth";
import type { TmeventsMapsResult } from "@/types/api/tmevents";
import { ServerError, ServerResponse } from "@/types/responses";
import { z } from "zod";

// Unlinks the signed-in user's own Trackmania Events account
export async function disconnectTmevents(): Promise<ServerResponse> {
  return doServerActionWithAuth([], async (session) => {
    await disconnect(session.user.id);
  });
}

const mapsInput = z.object({
  eventId: z.string().min(1).max(200),
  uids: z.array(z.string().min(1).max(64)).max(200),
});

// Downloads an event's tracks that are missing on the server and adds them
export async function addTmeventsMaps(
  serverId: string,
  eventId: string,
  uids: string[],
): Promise<ServerResponse<TmeventsMapsResult>> {
  assertResourceId(serverId);
  return doServerActionWithAuth(
    [`servers:${serverId}:admin`, `group:servers:${serverId}:admin`],
    (session) => {
      const input = mapsInput.safeParse({ eventId, uids });
      if (!input.success)
        throw new ServerError("Invalid request", "ValidationError");
      return addTmeventsMapsAs(
        actorFromSession(session),
        serverId,
        input.data.eventId,
        input.data.uids,
      );
    },
  );
}
