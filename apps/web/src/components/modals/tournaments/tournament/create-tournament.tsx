"use client";
import { ModalContent } from "@/components/modals/modal";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateTournamentForm from "@/forms/tournaments/tournament/create-tournament-form";
import { DefaultModalProps } from "../../default-props";

export default function CreateTournamentModal({
  closeModal,
}: DefaultModalProps) {
  return (
    <ModalContent className="gap-6 sm:min-w-[400px]">
      <DialogHeader className="pr-6">
        <DialogTitle>Create Tournament</DialogTitle>
      </DialogHeader>

      <CreateTournamentForm callback={closeModal} />
    </ModalContent>
  );
}
