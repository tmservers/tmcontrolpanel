"use client";

import { ModalContent } from "@/components/modals/modal";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditHetznerTokenForm } from "@/forms/settings/hetzner-token/edit-hetzner-token-form";
import type { DefaultModalProps } from "../default-props";

export default function EditHetznerTokenModal({
  data,
  closeModal,
}: DefaultModalProps<{ id: string; name: string }>) {
  if (!data) return null;
  return (
    <ModalContent>
      <DialogHeader className="pr-6">
        <DialogTitle>Edit Hetzner token</DialogTitle>
      </DialogHeader>
      <EditHetznerTokenForm
        projectId={data.id}
        name={data.name}
        onSuccess={() => closeModal?.()}
      />
    </ModalContent>
  );
}
