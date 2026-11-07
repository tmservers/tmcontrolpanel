"use client";
import { ModalContent } from "@/components/modals/modal";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditRegistrationSettingsForm from "@/forms/tournaments/competition/edit-registration-settings-form";
import { RegistrationSettings } from "@/lib/server-manager/types";
import { Infer } from "spacetimedb";
import { DefaultModalProps } from "../../default-props";

export default function EditRegistrationSettingsModal({
  data,
  closeModal,
}: DefaultModalProps<{
  registrationId: number;
  registrationSettings: Infer<typeof RegistrationSettings>;
}>) {
  if (!data) return null;

  return (
    <ModalContent className="gap-6 sm:min-w-100">
      <DialogHeader className="pr-6">
        <DialogTitle>Edit Registration</DialogTitle>
      </DialogHeader>

      <EditRegistrationSettingsForm
        registrationId={data.registrationId}
        registrationSettings={data.registrationSettings}
        callback={closeModal}
      />
    </ModalContent>
  );
}
