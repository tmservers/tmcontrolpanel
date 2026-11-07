"use client";
import { ModalContent } from "@/components/modals/modal";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditCompetitionForm from "@/forms/tournaments/competition/edit-competition-form";
import { CompetitionV1 } from "@/lib/server-manager/types";
import { Infer } from "spacetimedb";
import { DefaultModalProps } from "../../default-props";

export default function EditCompetitionModal({
  data,
  closeModal,
}: DefaultModalProps<Infer<typeof CompetitionV1>>) {
  if (!data) return null;

  return (
    <ModalContent className="gap-6 sm:min-w-[400px]">
      <DialogHeader className="pr-6">
        <DialogTitle>Edit Stage</DialogTitle>
      </DialogHeader>

      <EditCompetitionForm competition={data} callback={closeModal} />
    </ModalContent>
  );
}
