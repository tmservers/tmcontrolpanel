"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHetznerDediServers } from "@/hooks/use-hetzner-queries";
import { getErrorMessage } from "@/lib/utils";
import type { HetznerDediServer } from "@/services/hetzner/servers";
import { IconArrowNarrowRight, IconLoader2 } from "@tabler/icons-react";
import { useState } from "react";

const NEW_SERVER = "new";

export type ServerTarget = HetznerDediServer | "new";

export default function MachineChoice({
  projectId,
  initialTarget,
  onContinue,
}: {
  projectId: string;
  initialTarget: ServerTarget;
  onContinue: (target: ServerTarget) => void;
}) {
  const { data, error, isPending, isError, isFetching, refetch } =
    useHetznerDediServers(projectId);
  const [selected, setSelected] = useState(
    initialTarget === "new" ? NEW_SERVER : initialTarget.id.toString(),
  );

  const machine = data?.find(
    (m) => m.id.toString() === selected && m.status === "running",
  );
  // A previously picked machine can't be confirmed until the list is back
  const waiting = selected !== NEW_SERVER && isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <Label htmlFor="quick-setup-machine">Server</Label>
        <Select
          value={waiting ? "" : machine ? selected : NEW_SERVER}
          onValueChange={(value) => {
            if (value) setSelected(value);
          }}
        >
          <SelectTrigger id="quick-setup-machine" className="w-full min-w-0">
            <SelectValue placeholder="Loading machines…" />
          </SelectTrigger>
          <SelectContent className="z-9999 max-w-[95vw]">
            <SelectItem value={NEW_SERVER} className="cursor-pointer">
              New server
            </SelectItem>
            {data?.map((m) => (
              <SelectItem
                key={m.id}
                value={m.id.toString()}
                disabled={m.status !== "running"}
                className="cursor-pointer"
              >
                {m.name} · {m.ip ?? "no IP"} · {m.tmServers} Trackmania{" "}
                {m.tmServers === 1 ? "server" : "servers"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isPending && (
          <p
            role="status"
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <IconLoader2 className="size-3 animate-spin" />
            Loading existing machines…
          </p>
        )}
        {isError && (
          <div className="flex flex-col items-start gap-2">
            <p role="alert" className="text-sm text-destructive">
              Failed to load existing machines: {getErrorMessage(error)}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </div>
        )}
      </div>

      <Button
        type="button"
        className="sm:self-end"
        disabled={waiting}
        onClick={() => onContinue(machine ?? "new")}
      >
        Continue
        <IconArrowNarrowRight />
      </Button>
    </div>
  );
}
