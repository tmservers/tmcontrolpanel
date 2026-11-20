"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTmeventsConnection, useTmeventsStatus } from "@/hooks/use-tmevents";
import { getErrorMessage } from "@/lib/utils";
import { IconCalendarEvent, IconLink, IconUnlink } from "@tabler/icons-react";

// External accounts the user links to the panel. Each user links their own.
export default function ConnectedApps() {
  const status = useTmeventsStatus();
  const connection = useTmeventsConnection();

  return (
    <section
      aria-labelledby="connected-apps-title"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2 id="connected-apps-title" className="text-lg font-semibold">
          Connected apps
        </h2>
        <p className="text-sm text-muted-foreground">
          Accounts on other services the panel may read for you.
        </p>
      </div>

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <IconCalendarEvent className="mt-0.5 size-5 shrink-0" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">Trackmania Events</h3>
              {status.data?.connected && (
                <Badge variant="outline">Connected</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Import teams, seeding, tracks and pick and ban settings of your
              events into plugin settings. You choose on Trackmania Events which
              events the panel may read.
            </p>
            <p className="text-xs text-muted-foreground">
              {status.isPending
                ? "Checking the connection..."
                : status.error
                  ? getErrorMessage(status.error)
                  : !status.data?.configured
                    ? "Trackmania Events is not set up on this panel"
                    : status.data.connected
                      ? `Connected as ${status.data.name}`
                      : "Not connected"}
            </p>
          </div>
        </div>
        {status.data?.configured && (
          <div className="shrink-0">
            {status.data.connected ? (
              <Button
                variant="outline"
                disabled={connection.disconnecting}
                onClick={() => void connection.disconnect()}
              >
                <IconUnlink />
                Disconnect
              </Button>
            ) : (
              <Button onClick={connection.connect}>
                <IconLink />
                Connect
              </Button>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}
