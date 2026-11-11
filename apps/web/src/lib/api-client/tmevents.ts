import type * as Tmevents from "@/services/tmevents";
import { apiGet } from "./http";

export const getTmeventsStatus = (
  signal?: AbortSignal,
): ReturnType<typeof Tmevents.getTmeventsStatus> =>
  apiGet("/api/tmevents/status", undefined, { signal });

export const getTmeventsEvents = (
  signal?: AbortSignal,
): ReturnType<typeof Tmevents.getTmeventsEvents> =>
  apiGet("/api/tmevents/events", undefined, { signal });

export const getTmeventsEventData = (
  eventId: string,
  signal?: AbortSignal,
): ReturnType<typeof Tmevents.getTmeventsEventData> =>
  apiGet(`/api/tmevents/events/${encodeURIComponent(eventId)}`, undefined, {
    signal,
  });
