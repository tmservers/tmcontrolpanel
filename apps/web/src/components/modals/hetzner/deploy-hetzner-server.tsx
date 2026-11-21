"use client";

import { DefaultModalProps } from "@/components/modals/default-props";
import { ModalContent } from "@/components/modals/modal";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DeployWizardForm from "@/forms/admin/hetzner/deploy-wizard/deploy-wizard-form";

export default function DeployHetznerServerModal({
  closeModal,
  onSubmit,
  data,
}: DefaultModalProps<{ canAddToken: boolean }>) {
  return (
    <ModalContent className="max-w-[min(64rem,calc(100vw-2rem))]">
      <DialogHeader className="pr-6">
        <DialogTitle>Deploy on Hetzner</DialogTitle>
      </DialogHeader>
      <DeployWizardForm
        canAddToken={data?.canAddToken ?? false}
        closeModal={closeModal}
        onSubmit={onSubmit}
      />
    </ModalContent>
  );
}
