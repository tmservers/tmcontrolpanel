"use client";

import { addTmeventsMaps } from "@/actions/tmevents";
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
  useTmeventsConnection,
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
import type {
  TmeventsEventData,
  TmeventsPlayer,
  TmeventsStep,
  TmeventsTeam,
} from "@/types/api/tmevents";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCalendarEvent,
  IconCheck,
  IconDownload,
  IconLink,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import type { PluginConfig, TmeventsImportPaths } from "@tmcontrolpanel/shared";
import { useId, useState } from "react";
import { toast } from "sonner";
import {
  MapsEditor,
  PickBanEditor,
  PlayersEditor,
  SeedingEditor,
  TeamsEditor,
} from "./tmevents-import-editors";

const EVENT_SEQUENCE = "event";

type Part = "participants" | "seeding" | "maps" | "pickBan";

// Lets an admin pick one of their Trackmania Events events, adjust it and copy parts of
// it into the settings form. Which parts exist comes from the plugin's manifest.
export function TmeventsImport({
  serverId,
  paths,
  values,
  localMaps,
  onImport,
}: {
  serverId?: string;
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
    downloadMaps: true,
  });
  const [importing, setImporting] = useState(false);
  // 0 picks the event, then one step per part, then the summary
  const [step, setStep] = useState(0);
  // An editable copy of the event; edits only change what gets imported
  const [draft, setDraft] = useState<TmeventsEventData | null>(null);
  const [excludedTracks, setExcludedTracks] = useState<string[]>([]);
  // Jump to the first part once a newly picked event has loaded
  const [advance, setAdvance] = useState(false);
  const status = useTmeventsStatus();
  const connected = open && status.data?.connected === true;
  const events = useTmeventsEvents(connected);
  const event = useTmeventsEventData(connected ? eventId : "");
  const connection = useTmeventsConnection();

  const data = event.data;
  if (data && draft?.event.id !== data.event.id) {
    setDraft(structuredClone(data));
    setExcludedTracks([]);
  }
  if (advance && draft) {
    setAdvance(false);
    setStep(1);
  }

  async function disconnect() {
    if (await connection.disconnect()) {
      setEventId("");
      setDraft(null);
    }
  }

  function edit(change: Partial<TmeventsEventData>) {
    setDraft((old) => (old ? { ...old, ...change } : old));
  }

  function choosePreset(next: string) {
    if (!data) return;
    setPresetId(next);
    edit({
      sequence: structuredClone(
        data.presets.find((preset) => preset.id === next)?.steps ??
          data.sequence,
      ),
    });
  }

  const teamBased = draft?.event.teamBased ?? false;
  const isOnServer = (uid: string) => localMaps.some((map) => map.UId === uid);
  const tracks =
    draft?.tracks.filter((track) => !excludedTracks.includes(track.uid)) ?? [];
  const missing = tracks.filter((track) => !isOnServer(track.uid));
  const parts: {
    key: Part;
    label: string;
    description: string;
    available: boolean;
  }[] = draft
    ? [
        {
          key: "participants",
          label: teamBased ? "Teams" : "Players",
          description: teamBased
            ? `${draft.teams.length} teams. Rename or remove teams and players. Replaces the current teams.`
            : `${draft.players.length} players. Remove players you don't want. Replaces the current players.`,
          available: !!(teamBased ? paths.teams : paths.players),
        },
        {
          key: "seeding",
          label: "Seeding",
          description:
            "From the seeds and ranking on Trackmania Events. The first entry is seed 1; move entries to change it.",
          available: !!(teamBased ? paths.teams : paths.players),
        },
        {
          key: "maps",
          label: "Maps",
          description: `${tracks.length} of ${draft.tracks.length} tracks selected, ${tracks.length - missing.length} on this server. Replaces the current maps.`,
          available: !!paths.maps,
        },
        {
          key: "pickBan",
          label: "Pick and ban order",
          description: `${draft.sequence.length} steps. Seed 1 is participant A on Trackmania Events, seed 2 is B.`,
          available: !!paths.order,
        },
      ]
    : [];
  const available = parts.filter((part) => part.available);
  const lastStep = available.length + 1;
  const current = step > 0 && step < lastStep ? available[step - 1] : undefined;

  function editor(part: Part) {
    if (!draft) return null;
    if (part === "participants")
      return teamBased ? (
        <TeamsEditor
          teams={draft.teams}
          onChange={(teams: TmeventsTeam[]) => edit({ teams })}
        />
      ) : (
        <PlayersEditor
          players={draft.players}
          onChange={(players: TmeventsPlayer[]) => edit({ players })}
        />
      );
    if (part === "seeding")
      return teamBased ? (
        <SeedingEditor
          entries={draft.teams}
          onChange={(teams) => edit({ teams })}
        />
      ) : (
        <SeedingEditor
          entries={draft.players}
          onChange={(players) => edit({ players })}
        />
      );
    if (part === "maps")
      return (
        <MapsEditor
          tracks={draft.tracks}
          excluded={excludedTracks}
          onServer={isOnServer}
          onToggle={(uid, included) =>
            setExcludedTracks((old) =>
              included ? old.filter((item) => item !== uid) : [...old, uid],
            )
          }
        />
      );
    return (
      <PickBanEditor
        steps={draft.sequence}
        onChange={(sequence: TmeventsStep[]) => edit({ sequence })}
      />
    );
  }

  // Puts missing event tracks on the server and returns the server's map list after it
  async function downloadMissing(): Promise<typeof localMaps> {
    if (!serverId || !draft) return localMaps;
    const { data: added, error } = await addTmeventsMaps(
      serverId,
      draft.event.id,
      missing.map((track) => track.uid),
    );
    if (error) {
      toast.error("Failed to add the missing tracks", { description: error });
      return localMaps;
    }
    if (added.failed.length)
      toast.warning(`${added.failed.length} tracks could not be added`, {
        description: added.failed.join(", "),
      });
    const key = queryKeys.localMaps(serverId);
    await queryClient.invalidateQueries({ queryKey: key });
    const fresh = queryClient.getQueryData<typeof localMaps>(key);
    return (
      fresh ?? [
        ...localMaps,
        ...added.added.map((map) => ({ UId: map.uid, FileName: map.fileName })),
      ]
    );
  }

  function close() {
    setOpen(false);
    setStep(0);
    // Reopening starts from the event as it is on Trackmania Events
    setDraft(null);
  }

  async function importEvent() {
    if (!draft || importing) return;
    // The draft already holds the chosen preset's steps
    const chosen: TmeventsImportOptions = { ...options, presetId: undefined };
    setImporting(true);
    const serverMaps =
      options.maps && options.downloadMaps && missing.length && serverId
        ? await downloadMissing()
        : localMaps;
    setImporting(false);
    const result = applyTmeventsImport(
      values,
      paths,
      { ...draft, tracks },
      chosen,
      serverMaps,
    );
    onImport(result.values);
    if (result.missingMaps.length)
      toast.warning(
        `${result.missingMaps.length} tracks are not on this server`,
        {
          description:
            "Add them to the server and import again, or pick them by hand.",
        },
      );
    else toast.success(`Imported ${draft.event.name}`);
    close();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setOpen(true);
          // An event picked before opens on its first part
          if (eventId) setAdvance(true);
        }}
      >
        <IconCalendarEvent />
        Import from Trackmania Events
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import from Trackmania Events</DialogTitle>
            <DialogDescription>
              Fills the settings form from one of your events. Nothing is stored
              until you save.
            </DialogDescription>
          </DialogHeader>
          {status.isPending ? (
            <p className="text-sm text-muted-foreground">
              Checking your Trackmania Events connection...
            </p>
          ) : status.error ? (
            <p role="alert" className="text-sm text-destructive">
              {getErrorMessage(status.error)}
            </p>
          ) : !status.data.configured ? (
            <p className="text-sm text-muted-foreground">
              Trackmania Events is not set up on this panel. The panel operator
              needs to add a Trackmania Events app with{" "}
              <code>TMEVENTS_CLIENT_ID</code>,{" "}
              <code>TMEVENTS_CLIENT_SECRET</code> and{" "}
              <code>TMEVENTS_REDIRECT_URI</code>.
            </p>
          ) : status.data.connected ? (
            <div className="flex flex-col gap-4">
              {draft && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1" aria-hidden>
                    {Array.from({ length: lastStep + 1 }, (_, index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Step {step + 1} of {lastStep + 1}:{" "}
                    {step === 0
                      ? "Event"
                      : step === lastStep
                        ? "Summary"
                        : current?.label}
                  </p>
                </div>
              )}

              {step === 0 && (
                <>
                  <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                    <span>Connected as {status.data.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={connection.disconnecting}
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
                        setDraft(null);
                        setAdvance(true);
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
                  {eventId && !draft && event.isPending && (
                    <p className="text-sm text-muted-foreground">
                      Loading event...
                    </p>
                  )}
                  {event.error && (
                    <p role="alert" className="text-sm text-destructive">
                      {getErrorMessage(event.error)}
                    </p>
                  )}
                  {draft && available.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      This plugin can&apos;t import anything from this event.
                    </p>
                  )}
                </>
              )}

              {step > 0 && !draft && event.isPending && (
                <p className="text-sm text-muted-foreground">
                  Loading event...
                </p>
              )}

              {draft && current && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id={`${id}-${current.key}`}
                      className="mt-0.5"
                      checked={options[current.key]}
                      onCheckedChange={(checked) =>
                        setOptions((value) => ({
                          ...value,
                          [current.key]: checked === true,
                        }))
                      }
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <Label htmlFor={`${id}-${current.key}`}>
                        Import {current.label.toLowerCase()}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {current.description}
                      </p>
                    </div>
                  </div>
                  {current.key === "pickBan" &&
                    options.pickBan &&
                    draft.presets.length > 0 && (
                      <Select value={presetId} onValueChange={choosePreset}>
                        <SelectTrigger
                          className="w-full"
                          aria-label="Start from a pick and ban sequence"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EVENT_SEQUENCE}>
                            Event sequence
                          </SelectItem>
                          {draft.presets.map((preset) => (
                            <SelectItem key={preset.id} value={preset.id}>
                              {preset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  {current.key === "maps" &&
                    options.maps &&
                    missing.length > 0 &&
                    serverId && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-download`}
                          checked={options.downloadMaps}
                          onCheckedChange={(checked) =>
                            setOptions((value) => ({
                              ...value,
                              downloadMaps: checked === true,
                            }))
                          }
                        />
                        <Label
                          htmlFor={`${id}-download`}
                          className="text-sm font-normal"
                        >
                          Download missing tracks from Nadeo and add them to the
                          server
                        </Label>
                      </div>
                    )}
                  {options[current.key] && editor(current.key)}
                </div>
              )}

              {draft && step === lastStep && step > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm">
                    Import into the settings form from{" "}
                    <span className="font-medium">{draft.event.name}</span>:
                  </p>
                  <ul className="flex flex-col gap-1.5 rounded-md border p-3 text-sm">
                    {available.map((part) => (
                      <li key={part.key} className="flex items-center gap-2">
                        {options[part.key] ? (
                          <IconCheck className="size-4 shrink-0 text-primary" />
                        ) : (
                          <span className="size-4 shrink-0" />
                        )}
                        <span
                          className={
                            options[part.key] ? "" : "text-muted-foreground"
                          }
                        >
                          {part.label}
                          {!options[part.key] && " (skipped)"}
                        </span>
                      </li>
                    ))}
                    {options.maps &&
                      options.downloadMaps &&
                      missing.length > 0 &&
                      serverId && (
                        <li className="flex items-center gap-2 text-muted-foreground">
                          <IconDownload className="size-4 shrink-0" />
                          {missing.length} missing tracks are downloaded first
                        </li>
                      )}
                  </ul>
                </div>
              )}

              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={step === 0 || importing}
                  onClick={() => setStep((value) => value - 1)}
                >
                  <IconArrowLeft />
                  Back
                </Button>
                {step < lastStep ? (
                  <Button
                    type="button"
                    disabled={!draft || available.length === 0}
                    onClick={() => setStep((value) => value + 1)}
                  >
                    Next
                    <IconArrowRight />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={
                      importing || !available.some((part) => options[part.key])
                    }
                    onClick={() => void importEvent()}
                  >
                    <IconDownload />
                    {importing ? "Adding tracks..." : "Import"}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Connect your Trackmania Events account and choose which events
                this panel may read.
              </p>
              <Button type="button" onClick={connection.connect}>
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
