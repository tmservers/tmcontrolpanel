"use client";

import { Button } from "@/components/ui/button";
import { useHetznerProvisioning } from "@/hooks/use-hetzner-queries";
import { ProvisioningStage } from "@/lib/hetzner-provisioning";
import { generatePath, getErrorMessage } from "@/lib/utils";
import { routes } from "@/routes";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Timeline, { TimelineItem } from "./timeline";

const SLOW_AFTER_MS = 10 * 60 * 1000;

// Index of the timeline step in progress for each stage
const ACTIVE_STEP: Record<ProvisioningStage, number> = {
  creating: 0,
  booting: 1,
  installing: 2,
  connected: 4,
  failed: -1,
};

export type LaunchedServer = {
  hetznerServerId: number;
  panelServerId?: string;
  panelServerError?: string;
  name: string;
};

export default function LaunchStep({
  projectId,
  server,
  onClose,
}: {
  projectId: string;
  server: LaunchedServer;
  onClose: () => void;
}) {
  const { data, error, isFetching, refetch } = useHetznerProvisioning(
    projectId,
    server.hetznerServerId,
    server.panelServerId,
  );
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timeout);
  }, []);

  const stage = data?.stage;
  const connected = stage === "connected";
  const failed = stage === "failed";
  // With an IP known, a null connection state means no panel server points at this machine
  const unlinked =
    !server.panelServerId || (!!data?.ip && data.panelConnected === null);
  const warn = failed || (slow && !connected);
  const active = stage ? ACTIVE_STEP[stage] : 0;

  const state = (index: number): TimelineItem["state"] => {
    // The server exists as soon as this step opens, even if its state went bad
    if (failed) return index === 0 ? "done" : "pending";
    if (index < active) return "done";
    // Without a panel server nothing can report that the install finished
    if (index === 2 && unlinked) return "pending";
    return index === active ? "active" : "pending";
  };

  const items: TimelineItem[] = [
    {
      label: "Hetzner server created",
      sub: data
        ? [data.serverType, data.ip].filter(Boolean).join(" · ")
        : undefined,
      state: state(0),
    },
    { label: "Booted", state: state(1) },
    {
      label: "Installing dedicated server",
      sub: "Usually 2–4 minutes",
      state: state(2),
    },
    unlinked
      ? {
          label: "Panel server not linked",
          sub: server.panelServerError
            ? `Saving the panel server failed: ${server.panelServerError}`
            : "The panel can't follow the connection for this machine.",
          state: "warning",
        }
      : { label: "Connected to the panel", state: state(3) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Timeline items={items} />

      {error && (
        <p role="alert" className="text-sm text-destructive">
          Failed to get the server status: {getErrorMessage(error)}
        </p>
      )}

      {(warn || error) && (
        <div className="flex flex-col gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm">
          {warn && (
            <p role="status">
              {failed
                ? "Hetzner reports a problem with this server."
                : "This is taking longer than expected."}{" "}
              <Link
                href={generatePath(routes.admin.hetznerServers, {
                  id: projectId,
                })}
                onClick={onClose}
                className="text-primary underline underline-offset-4"
              >
                Check the server in your Hetzner project
              </Link>
              .
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            Check again
          </Button>
        </div>
      )}

      {!unlinked && (
        <p className="text-sm text-muted-foreground">
          You can close this window. The server is already listed and connects
          on its own.
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
        {connected && server.panelServerId ? (
          <Button asChild>
            <Link
              href={generatePath(routes.servers.live, {
                id: server.panelServerId,
              })}
              onClick={onClose}
            >
              Open server
              <IconArrowNarrowRight />
            </Link>
          </Button>
        ) : (
          <Button type="button" disabled>
            Open server
            <IconArrowNarrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
