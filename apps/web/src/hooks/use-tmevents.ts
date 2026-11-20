"use client";

import { disconnectTmevents } from "@/actions/tmevents";
import { queryKeys, unwrap } from "@/lib/api-client/query";
import {
  getTmeventsEventData,
  getTmeventsEvents,
  getTmeventsStatus,
} from "@/lib/api-client/tmevents";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

// Links and unlinks the user's Trackmania Events account; the sign-in runs in a popup
export function useTmeventsConnection() {
  const queryClient = useQueryClient();
  const [disconnecting, setDisconnecting] = useState(false);

  // The popup's last page reports how it went
  useEffect(() => {
    function onMessage(message: MessageEvent) {
      if (
        message.origin !== window.location.origin ||
        message.data?.type !== "tmevents"
      )
        return;
      if (message.data.outcome === "connected") {
        toast.success("Trackmania Events is connected");
        void queryClient.invalidateQueries({ queryKey: ["tmevents"] });
      } else toast.error("Trackmania Events was not connected");
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [queryClient]);

  function connect() {
    window.open(
      "/api/tmevents/authorize",
      "tmevents",
      "popup,width=600,height=760",
    );
  }

  async function disconnect(): Promise<boolean> {
    setDisconnecting(true);
    const { error } = await disconnectTmevents();
    setDisconnecting(false);
    if (error) {
      toast.error("Failed to disconnect Trackmania Events", {
        description: error,
      });
      return false;
    }
    await queryClient.invalidateQueries({ queryKey: ["tmevents"] });
    return true;
  }

  return { connect, disconnect, disconnecting };
}
