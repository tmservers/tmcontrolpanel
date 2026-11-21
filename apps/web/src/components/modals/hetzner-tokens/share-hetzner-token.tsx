"use client";

import { ModalContent } from "@/components/modals/modal";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShareHetznerTokenForm } from "@/forms/settings/hetzner-token/share-hetzner-token-form";
import type { DefaultModalProps } from "../default-props";

type Group = { id: string; name: string };
type Data = {
  id: string;
  name: string;
  shareableGroups: Group[];
  groups: Group[];
};
export default function ShareHetznerTokenModal({
  data,
  closeModal,
}: DefaultModalProps<Data>) {
  if (!data) return null;
  return (
    <ModalContent>
      <DialogHeader className="pr-6">
        <DialogTitle>Share {data.name}</DialogTitle>
        <DialogDescription>
          Group admins can deploy and manage servers on this token, and
          moderators can view them. Nobody but you can see or change the token
          itself.
        </DialogDescription>
      </DialogHeader>
      <ShareHetznerTokenForm
        projectId={data.id}
        shareableGroups={data.shareableGroups}
        currentGroups={data.groups}
        onSuccess={() => closeModal?.()}
      />
    </ModalContent>
  );
}
