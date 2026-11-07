"use client";
import { ModalContent } from "@/components/modals/modal";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OverrideRegistrationsForm from "@/forms/tournaments/competition/override-registrations-form";
import { DefaultModalProps } from "../../default-props";

export default function OverrideRegistrationsModal({
  data,
  closeModal,
}: DefaultModalProps<{
  registrationId: number;
}>) {
  if (!data) return null;

  return (
    <ModalContent className="gap-6 sm:min-w-100">
      <DialogHeader className="pr-6">
        <DialogTitle>Override Registrations</DialogTitle>
      </DialogHeader>

      <OverrideRegistrationsForm
        registrationId={data.registrationId}
        callback={closeModal}
      />
    </ModalContent>
  );
}
