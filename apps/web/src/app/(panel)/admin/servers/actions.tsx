"use client";

import DeployHetznerServerModal from "@/components/modals/hetzner/deploy-hetzner-server";
import Modal from "@/components/modals/modal";
import AddServerModal from "@/components/modals/servers/add-server";
import { Button } from "@/components/ui/button";
import { HetznerServerCache } from "@/types/api/hetzner/servers";
import { IconCloudPlus, IconPlus } from "@tabler/icons-react";

export const createActions = (
  refetch: () => void,
  args?: {
    recentlyCreatedServers: HetznerServerCache[];
    canCreateServer: boolean;
    canDeploy: boolean;
    canAddToken: boolean;
  },
) => {
  return (
    <div className="flex gap-2">
      {args?.canCreateServer && (
        <Modal closeOnBackdropClick={false}>
          <AddServerModal
            data={args.recentlyCreatedServers}
            onSubmit={refetch}
          />
          <Button className="relative w-9 sm:w-auto">
            <IconPlus />
            <span className="hidden sm:inline">Add Server</span>
            {args.recentlyCreatedServers.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive text-center text-[8px]">
                {args.recentlyCreatedServers.length}
              </span>
            )}
          </Button>
        </Modal>
      )}
      {args?.canDeploy && (
        <Modal closeOnBackdropClick={false}>
          <DeployHetznerServerModal
            data={{ canAddToken: args.canAddToken }}
            onSubmit={refetch}
          />
          <Button className="w-9 sm:w-auto">
            <IconCloudPlus />
            <span className="hidden sm:inline">Deploy on Hetzner</span>
          </Button>
        </Modal>
      )}
    </div>
  );
};
