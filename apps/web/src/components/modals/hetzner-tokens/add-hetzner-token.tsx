"use client";

import { ModalContent } from "@/components/modals/modal";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddHetznerTokenForm } from "@/forms/settings/hetzner-token/add-hetzner-token-form";
import type { DefaultModalProps } from "../default-props";

export default function AddHetznerTokenModal({
  closeModal,
}: DefaultModalProps) {
  return (
    <ModalContent>
      <DialogHeader className="pr-6">
        <DialogTitle>Add Hetzner token</DialogTitle>
      </DialogHeader>
      <AddHetznerTokenForm onSuccess={() => closeModal?.()} />
    </ModalContent>
  );
}
