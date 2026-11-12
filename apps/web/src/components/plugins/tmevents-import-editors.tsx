"use client";

import { TmText } from "@/components/tm-text";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  TmeventsPlayer,
  TmeventsStep,
  TmeventsTeam,
  TmeventsTrack,
} from "@/types/api/tmevents";
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import type { ReactNode } from "react";

// Scrolls long lists inside the step instead of growing the dialog
export function StepList({ children }: { children: ReactNode }) {
  return (
    <div className="max-h-[45vh] overflow-y-auto rounded-md border p-2 text-sm">
      {children}
    </div>
  );
}

function without<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

function moved<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function TeamsEditor({
  teams,
  onChange,
}: {
  teams: TmeventsTeam[];
  onChange: (teams: TmeventsTeam[]) => void;
}) {
  const update = (index: number, team: TmeventsTeam) =>
    onChange(teams.map((old, i) => (i === index ? team : old)));
  return (
    <StepList>
      <ul className="flex flex-col gap-3">
        {teams.map((team, index) => (
          <li key={index} className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <Input
                value={team.name}
                aria-label={`Name of team ${index + 1}`}
                onChange={(e) =>
                  update(index, { ...team, name: e.target.value })
                }
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Remove team ${team.name}`}
                onClick={() => onChange(without(teams, index))}
              >
                <IconTrash />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {team.players.map((player, playerIndex) => (
                <PlayerChip
                  key={player.login}
                  player={player}
                  onRemove={() =>
                    update(index, {
                      ...team,
                      players: without(team.players, playerIndex),
                    })
                  }
                />
              ))}
              {team.players.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  No players
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </StepList>
  );
}

function PlayerChip({
  player,
  onRemove,
}: {
  player: TmeventsPlayer;
  onRemove: () => void;
}) {
  return (
    <span className="flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs">
      <TmText text={player.name} />
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground"
        aria-label={`Remove ${player.name}`}
        onClick={onRemove}
      >
        <IconX className="size-3" />
      </button>
    </span>
  );
}

export function PlayersEditor({
  players,
  onChange,
}: {
  players: TmeventsPlayer[];
  onChange: (players: TmeventsPlayer[]) => void;
}) {
  return (
    <StepList>
      <div className="flex flex-wrap gap-1">
        {players.map((player, index) => (
          <PlayerChip
            key={player.login}
            player={player}
            onRemove={() => onChange(without(players, index))}
          />
        ))}
      </div>
    </StepList>
  );
}

// The order is the seeding: the first entry is seed 1
export function SeedingEditor<
  T extends { name: string; averagePosition?: number | null },
>({ entries, onChange }: { entries: T[]; onChange: (entries: T[]) => void }) {
  return (
    <StepList>
      <ol className="flex flex-col gap-1">
        {entries.map((entry, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-right text-muted-foreground">
              {index + 1}.
            </span>
            <TmText text={entry.name} className="min-w-0 flex-1 truncate" />
            <span
              className="shrink-0 text-xs text-muted-foreground tabular-nums"
              title="Average position on Trackmania Events"
            >
              {typeof entry.averagePosition === "number"
                ? `Avg. ${entry.averagePosition.toFixed(2)}`
                : "Unranked"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={index === 0}
              aria-label={`Move ${entry.name} up`}
              onClick={() => onChange(moved(entries, index, index - 1))}
            >
              <IconArrowUp />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={index === entries.length - 1}
              aria-label={`Move ${entry.name} down`}
              onClick={() => onChange(moved(entries, index, index + 1))}
            >
              <IconArrowDown />
            </Button>
          </li>
        ))}
      </ol>
    </StepList>
  );
}

export function MapsEditor({
  tracks,
  excluded,
  onServer,
  onToggle,
}: {
  tracks: TmeventsTrack[];
  excluded: string[];
  onServer: (uid: string) => boolean;
  onToggle: (uid: string, included: boolean) => void;
}) {
  return (
    <StepList>
      <ul className="flex flex-col gap-1.5">
        {tracks.map((track) => (
          <li key={track.uid} className="flex items-center gap-2">
            <Checkbox
              checked={!excluded.includes(track.uid)}
              aria-label={`Import ${track.name}`}
              onCheckedChange={(checked) =>
                onToggle(track.uid, checked === true)
              }
            />
            <TmText text={track.name} className="min-w-0 flex-1 truncate" />
            {onServer(track.uid) ? (
              <IconCheck
                className="size-4 shrink-0 text-primary"
                aria-label="On the server"
              />
            ) : (
              <span className="shrink-0 text-xs text-muted-foreground">
                Not on the server
              </span>
            )}
          </li>
        ))}
      </ul>
    </StepList>
  );
}

export function PickBanEditor({
  steps,
  onChange,
}: {
  steps: TmeventsStep[];
  onChange: (steps: TmeventsStep[]) => void;
}) {
  const update = (index: number, step: TmeventsStep) =>
    onChange(steps.map((old, i) => (i === index ? step : old)));
  return (
    <StepList>
      <ol className="flex flex-col gap-2">
        {steps.map((step, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-right text-muted-foreground">
              {index + 1}.
            </span>
            <Select
              value={step.action}
              onValueChange={(action) =>
                update(index, {
                  ...step,
                  action: action as TmeventsStep["action"],
                })
              }
            >
              <SelectTrigger
                className="flex-1"
                aria-label={`Step ${index + 1} action`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pick">Pick</SelectItem>
                <SelectItem value="Ban">Ban</SelectItem>
                <SelectItem value="Random">Random map</SelectItem>
              </SelectContent>
            </Select>
            {step.action !== "Random" && (
              <Select
                value={step.participant}
                onValueChange={(participant) =>
                  update(index, {
                    ...step,
                    participant: participant as TmeventsStep["participant"],
                  })
                }
              >
                <SelectTrigger
                  className="flex-1"
                  aria-label={`Step ${index + 1} seed`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Seed 1</SelectItem>
                  <SelectItem value="B">Seed 2</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Remove step ${index + 1}`}
              onClick={() => onChange(without(steps, index))}
            >
              <IconTrash />
            </Button>
          </li>
        ))}
      </ol>
      <Button
        type="button"
        variant="outline"
        className="mt-2 w-full"
        onClick={() =>
          onChange([...steps, { participant: "A", action: "Pick" }])
        }
      >
        <IconPlus />
        Add step
      </Button>
    </StepList>
  );
}
