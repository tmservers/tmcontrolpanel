"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useHetznerLocations,
  useHetznerServerTypes,
  useHetznerSshKeys,
} from "@/hooks/use-hetzner-queries";
import { getErrorMessage } from "@/lib/utils";
import { IconArrowNarrowLeft } from "@tabler/icons-react";
import { LaunchedServer } from "./launch-step";
import ServerForm from "./server-form";

export default function ServerStep({
  projectId,
  onBack,
  onLaunched,
}: {
  projectId: string;
  onBack?: () => void;
  onLaunched: (server: LaunchedServer) => void;
}) {
  const locationsQuery = useHetznerLocations(projectId);
  const serverTypesQuery = useHetznerServerTypes(projectId);
  const sshKeysQuery = useHetznerSshKeys(projectId);

  if (locationsQuery.data && serverTypesQuery.data && sshKeysQuery.data) {
    return (
      <ServerForm
        projectId={projectId}
        locations={locationsQuery.data}
        serverTypes={serverTypesQuery.data}
        sshKeys={sshKeysQuery.data}
        onBack={onBack}
        onLaunched={onLaunched}
      />
    );
  }

  const queries = [locationsQuery, serverTypesQuery, sshKeysQuery];
  const failed = queries.filter((q) => q.isError);
  const retrying = failed.some((q) => q.isFetching);

  return (
    <div className="flex flex-col gap-4">
      {failed.length > 0 ? (
        <p role="alert" className="text-sm text-destructive">
          Failed to load Hetzner options: {getErrorMessage(failed[0].error)}
        </p>
      ) : (
        <div role="status" className="flex flex-col gap-3">
          <span className="sr-only">Loading Hetzner options</span>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      <div className="flex justify-between gap-2">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            <IconArrowNarrowLeft />
            Back
          </Button>
        )}
        {failed.length > 0 && (
          <Button
            type="button"
            className="ml-auto"
            disabled={retrying}
            onClick={() => failed.forEach((q) => q.refetch())}
          >
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
