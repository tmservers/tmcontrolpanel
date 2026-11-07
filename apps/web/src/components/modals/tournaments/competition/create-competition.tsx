"use client";
import { ModalContent } from "@/components/modals/modal";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateCompetitionForm from "@/forms/tournaments/competition/create-competition-form";
import { DefaultModalProps } from "../../default-props";

export default function CreateCompetitionModal({
  data,
  closeModal,
}: DefaultModalProps<number>) {
  if (!data) return null;

  return (
    <ModalContent className="gap-6 sm:min-w-[400px]">
      <DialogHeader className="pr-6">
        <DialogTitle>Add Stage</DialogTitle>
      </DialogHeader>

      <CreateCompetitionForm parentId={data} callback={closeModal} />
    </ModalContent>
  );
}
