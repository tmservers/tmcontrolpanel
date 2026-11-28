"use client";

import QuickSetupModal from "@/components/modals/hetzner/quick-setup";
import Modal from "@/components/modals/modal";
import AddServerModal from "@/components/modals/servers/add-server";
import { Button } from "@/components/ui/button";
import { HetznerServerCache } from "@/types/api/hetzner/servers";
import { IconPlus, IconRocket } from "@tabler/icons-react";

export const createActions = (
  refetch: () => void,
  args?: {
    recentlyCreatedServers: HetznerServerCache[];
    canQuickSetup: boolean;
  },
) => {
  return (
    <div className="flex gap-2">
      {args?.canQuickSetup && (
        <Modal closeOnBackdropClick={false}>
          <QuickSetupModal onSubmit={refetch} />
          <Button collapse="sm" variant="outline">
            <IconRocket />
            Quick setup
          </Button>
        </Modal>
      )}
      <Modal closeOnBackdropClick={false}>
        <AddServerModal
          data={args?.recentlyCreatedServers}
          onSubmit={refetch}
        />
        <Button className="w-9 sm:w-auto relative">
          <IconPlus />
          <span className="hidden sm:inline">Add Server</span>
          {args?.recentlyCreatedServers &&
            args.recentlyCreatedServers.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 text-center rounded-full bg-destructive text-[8px]">
                {args.recentlyCreatedServers.length}
              </span>
            )}
        </Button>
      </Modal>
    </div>
  );
};
