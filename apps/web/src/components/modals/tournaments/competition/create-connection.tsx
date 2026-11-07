"use client";
import { ModalContent } from "@/components/modals/modal";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateConnectionForm from "@/forms/tournaments/competition/create-connection-form";
import { NodeHandle } from "@/lib/server-manager/types";
import { DefaultModalProps } from "../../default-props";

export default function CreateConnectionModal({
  data,
  closeModal,
}: DefaultModalProps<{
  origin: NodeHandle;
  target: NodeHandle;
}>) {
  if (!data) return null;

  return (
    <ModalContent className="gap-6 sm:min-w-100">
      <DialogHeader className="pr-6">
        <DialogTitle>Create Connection</DialogTitle>
      </DialogHeader>

      <CreateConnectionForm {...data} callback={closeModal} />
    </ModalContent>
  );
}
