"use client";
import { ModalContent } from "@/components/modals/modal";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditTournamentForm from "@/forms/tournaments/tournament/edit-tournament-form";
import { ProjectV1 } from "@/lib/server-manager/types";
import { Infer } from "spacetimedb";
import { DefaultModalProps } from "../../default-props";

export default function EditTournamentModal({
  data,
  closeModal,
}: DefaultModalProps<Infer<typeof ProjectV1>>) {
  if (!data) return null;

  return (
    <ModalContent className="gap-6 sm:min-w-[400px]">
      <DialogHeader className="pr-6">
        <DialogTitle>Edit Tournament</DialogTitle>
      </DialogHeader>

      <EditTournamentForm tournament={data} callback={closeModal} />
    </ModalContent>
  );
}
