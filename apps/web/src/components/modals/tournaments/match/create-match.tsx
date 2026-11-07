"use client";
import { ModalContent } from "@/components/modals/modal";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateMatchForm from "@/forms/tournaments/match/create-match-form";
import { DefaultModalProps } from "../../default-props";

export default function CreateMatchModal({
  data,
  closeModal,
}: DefaultModalProps<number>) {
  if (!data) return null;

  return (
    <ModalContent className="gap-6 sm:min-w-[400px]">
      <DialogHeader className="pr-6">
        <DialogTitle>Add Match</DialogTitle>
      </DialogHeader>

      <CreateMatchForm competitionId={data} callback={closeModal} />
    </ModalContent>
  );
}
