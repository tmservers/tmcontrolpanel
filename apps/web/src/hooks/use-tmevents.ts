"use client";

import { queryKeys, unwrap } from "@/lib/api-client/query";
import {
  getTmeventsEventData,
  getTmeventsEvents,
  getTmeventsStatus,
} from "@/lib/api-client/tmevents";
import { useQuery } from "@tanstack/react-query";

export const useTmeventsStatus = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.tmeventsStatus(),
    queryFn: ({ signal }) =>
      unwrap(getTmeventsStatus(signal), "GetTmeventsStatusError"),
    enabled,
    staleTime: 60_000,
  });

// Events change on Trackmania Events, not here: read them again each time the dialog opens
export const useTmeventsEvents = (enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.tmeventsEvents(),
    queryFn: ({ signal }) =>
      unwrap(getTmeventsEvents(signal), "GetTmeventsEventsError"),
    enabled,
    staleTime: 0,
    gcTime: 0,
  });

export const useTmeventsEventData = (eventId: string) =>
  useQuery({
    queryKey: queryKeys.tmeventsEvent(eventId),
    queryFn: ({ signal }) =>
      unwrap(getTmeventsEventData(eventId, signal), "GetTmeventsEventError"),
    enabled: !!eventId,
    staleTime: 0,
    gcTime: 0,
  });
