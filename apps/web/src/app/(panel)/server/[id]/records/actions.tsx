"use client";

import { Button } from "@/components/ui/button";
import { exportRecords } from "@/lib/api-client/database";
import { getErrorMessage } from "@/lib/utils";
import { ServerError } from "@/types/responses";
import { IconDownload } from "@tabler/icons-react";
import { toast } from "sonner";

export default function ServerRecordsActions({
  serverId,
}: {
  serverId: string;
}) {
  const handleExport = async () => {
    try {
      const { data, error } = await exportRecords(serverId);
      if (error) {
        throw new ServerError(error, "ExportRecordsError");
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `records_${serverId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to export records", {
        description: getErrorMessage(err),
      });
    }
  };

  return (
    <Button onClick={handleExport} variant="outline">
      Export Records
      <IconDownload />
    </Button>
  );
}

// Renders the export button in a records table's search row
export function createRecordsActions(_refetch: () => void, serverId?: string) {
  return serverId ? <ServerRecordsActions serverId={serverId} /> : null;
}
