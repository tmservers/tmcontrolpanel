"use client";

import QuickSetupModal from "@/components/modals/hetzner/quick-setup";
import Modal from "@/components/modals/modal";
import AddProjectModal from "@/components/modals/projects/add-project";
import { Button } from "@/components/ui/button";
import { IconPlus, IconRocket } from "@tabler/icons-react";

export const createActions = (refetch: () => void) => {
  return (
    <div className="flex gap-2">
      <Modal closeOnBackdropClick={false}>
        <QuickSetupModal onSubmit={refetch} />
        <Button collapse="sm" variant="outline">
          <IconRocket />
          Quick setup
        </Button>
      </Modal>
      <Modal closeOnBackdropClick={false}>
        <AddProjectModal onSubmit={refetch} />
        <Button collapse="sm">
          <IconPlus />
          Add Project
        </Button>
      </Modal>
    </div>
  );
};
