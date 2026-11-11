"use client";

import { disconnectTmevents } from "@/actions/tmevents";
import { TmText } from "@/components/tm-text";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTmeventsEventData,
  useTmeventsEvents,
  useTmeventsStatus,
} from "@/hooks/use-tmevents";
import { queryKeys } from "@/lib/api-client/query";
import {
  applyTmeventsImport,
  type TmeventsImportOptions,
} from "@/lib/tmevents/import";
import { getErrorMessage } from "@/lib/utils";
import { IconCalendarEvent, IconDownload, IconLink } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import type { PluginConfig, TmeventsImportPaths } from "@tmcontrolpanel/shared";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

const EVENT_SEQUENCE = "event";

// Lets an admin pick one of their Trackmania Events events and copy parts of it into
// the settings form. Which parts exist comes from the plugin's manifest.
export function TmeventsImport({
  paths,
  values,
  localMaps,
  onImport,
}: {
  paths: TmeventsImportPaths;
  values: PluginConfig;
  localMaps: { UId: string; FileName: string }[];
  onImport: (values: PluginConfig) => void;
}) {
  const id = useId();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [eventId, setEventId] = useState("");
  const [presetId, setPresetId] = useState(EVENT_SEQUENCE);
  const [options, setOptions] = useState({
    participants: true,
    seeding: true,
    maps: true,
    pickBan: true,
  });
  const status = useTmeventsStatus();
  const connected = open && status.data?.connected === true;
  const events = useTmeventsEvents(connected);
  const event = useTmeventsEventData(connected ? eventId : "");

  // The sign-in popup reports back when it is done
  useEffect(() => {
    if (!open) return;
    function onMessage(message: MessageEvent) {
      if (
        message.origin !== window.location.origin ||
        message.data?.type !== "tmevents"
      )
        return;
      if (message.data.outcome === "connected")
        void queryClient.invalidateQueries({
          queryKey: queryKeys.tmeventsStatus(),
        });
      else toast.error("Trackmania Events was not connected");
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [open, queryClient]);

  if (!status.data?.configured) return null;

  async function disconnect() {
    const { error } = await disconnectTmevents();
    if (error) {
      toast.error("Failed to disconnect Trackmania Events", {
        description: error,
      });
      return;
    }
    setEventId("");
    await queryClient.invalidateQueries({
      queryKey: queryKeys.tmeventsStatus(),
    });
  }

  const data = event.data;
  const teamBased = data?.event.teamBased ?? false;
  const steps =
    data?.presets.find((preset) => preset.id === presetId)?.steps ??
    data?.sequence ??
    [];
  const onServer = data
    ? data.tracks.filter((track) =>
        localMaps.some((map) => map.UId === track.uid),
      ).length
    : 0;
  const parts: {
    key: keyof typeof options;
    label: string;
    description: string;
    available: boolean;
  }[] = data
    ? [
        {
          key: "participants",
          label: teamBased ? "Teams" : "Players",
          description: teamBased
            ? `${data.teams.length} teams with their players. Replaces the current teams.`
            : `${data.players.length} players. Replaces the current players.`,
          available: !!(teamBased ? paths.teams : paths.players),
        },
        {
          key: "seeding",
          label: "Seeding",
          description: `Seeds follow the order of the ${teamBased ? "teams" : "players"} on Trackmania Events.`,
          available: !!(teamBased ? paths.teams : paths.players),
        },
        {
          key: "maps",
          label: "Maps",
          description: `${onServer} of ${data.tracks.length} tracks are on this server. Replaces the current maps.`,
          available: !!paths.maps,
        },
        {
          key: "pickBan",
          label: "Pick and ban order",
          description: `${steps.length} steps. Participant A acts as seed 1, B as seed 2.`,
          available: !!paths.order,
        },
      ]
    : [];
  const available = parts.filter((part) => part.available);

  function importEvent() {
    if (!data) return;
    const chosen: TmeventsImportOptions = {
      ...options,
      presetId: presetId === EVENT_SEQUENCE ? undefined : presetId,
    };
    const result = applyTmeventsImport(values, paths, data, chosen, localMaps);
    onImport(result.values);
    if (result.missingMaps.length)
      toast.warning(
        `${result.missingMaps.length} tracks are not on this server`,
        {
          description:
            "Add them to the server and import again, or pick them by hand.",
        },
      );
    else toast.success(`Imported ${data.event.name}`);
    setOpen(false);
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <IconCalendarEvent />
        Import from Trackmania Events
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import from Trackmania Events</DialogTitle>
            <DialogDescription>
              Fills the settings form from one of your events. Nothing is stored
              until you save.
            </DialogDescription>
          </DialogHeader>
          {status.data.connected ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>Connected as {status.data.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void disconnect()}
                >
                  Disconnect
                </Button>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${id}-event`}>Event</Label>
                <Select
                  value={eventId}
                  onValueChange={(next) => {
                    setEventId(next);
                    setPresetId(EVENT_SEQUENCE);
                  }}
                  disabled={!events.data?.length}
                >
                  <SelectTrigger id={`${id}-event`} className="w-full">
                    <SelectValue
                      placeholder={
                        events.isPending
                          ? "Loading events..."
                          : events.data?.length
                            ? "Choose an event..."
                            : "No events shared with this panel"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {events.data?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {events.error && (
                  <p role="alert" className="text-xs text-destructive">
                    {getErrorMessage(events.error)}
                  </p>
                )}
              </div>
              {eventId && event.isPending && (
                <p className="text-sm text-muted-foreground">
                  Loading event...
                </p>
              )}
              {event.error && (
                <p role="alert" className="text-sm text-destructive">
                  {getErrorMessage(event.error)}
                </p>
              )}
              {data &&
                available.map((part) => (
                  <div key={part.key} className="flex items-start gap-2">
                    <Checkbox
                      id={`${id}-${part.key}`}
                      className="mt-0.5"
                      checked={options[part.key]}
                      onCheckedChange={(checked) =>
                        setOptions((current) => ({
                          ...current,
                          [part.key]: checked === true,
                        }))
                      }
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <Label htmlFor={`${id}-${part.key}`}>{part.label}</Label>
                      <p className="text-xs text-muted-foreground">
                        {part.description}
                      </p>
                      {part.key === "pickBan" &&
                        options.pickBan &&
                        data.presets.length > 0 && (
                          <Select value={presetId} onValueChange={setPresetId}>
                            <SelectTrigger
                              className="w-full"
                              aria-label="Pick and ban sequence"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={EVENT_SEQUENCE}>
                                Event sequence
                              </SelectItem>
                              {data.presets.map((preset) => (
                                <SelectItem key={preset.id} value={preset.id}>
                                  {preset.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      {part.key === "maps" &&
                        options.maps &&
                        onServer < data.tracks.length && (
                          <ul className="text-xs text-muted-foreground">
                            {data.tracks
                              .filter(
                                (track) =>
                                  !localMaps.some(
                                    (map) => map.UId === track.uid,
                                  ),
                              )
                              .map((track) => (
                                <li key={track.uid}>
                                  Not on the server:{" "}
                                  <TmText text={track.name} />
                                </li>
                              ))}
                          </ul>
                        )}
                    </div>
                  </div>
                ))}
              <Button
                type="button"
                disabled={!data || !available.some((part) => options[part.key])}
                onClick={importEvent}
              >
                <IconDownload />
                Import
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Connect your Trackmania Events account and choose which events
                this panel may read.
              </p>
              <Button
                type="button"
                onClick={() =>
                  window.open(
                    "/api/tmevents/authorize",
                    "tmevents",
                    "popup,width=600,height=760",
                  )
                }
              >
                <IconLink />
                Connect Trackmania Events
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
