"use client";

import { ModalContent } from "@/components/modals/modal";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ConnectStep from "@/forms/admin/hetzner/quick-setup/connect-step";
import LaunchStep, {
  LaunchedServer,
} from "@/forms/admin/hetzner/quick-setup/launch-step";
import ServerStep from "@/forms/admin/hetzner/quick-setup/server-step";
import Stepper from "@/forms/admin/hetzner/quick-setup/stepper";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { DefaultModalProps } from "../default-props";

export default function QuickSetupModal({
  data,
  closeModal,
  onSubmit,
}: DefaultModalProps<string>) {
  const { update } = useSession();
  const [projectId, setProjectId] = useState(data ?? "");
  const [launched, setLaunched] = useState<LaunchedServer>();

  const changed = useRef(false);
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  // On unmount, so the close button, the X, Escape and navigating away are all covered
  useEffect(
    () => () => {
      if (changed.current) onSubmitRef.current?.();
    },
    [],
  );

  const step = launched ? 2 : projectId ? 1 : 0;

  return (
    <ModalContent className="w-full max-w-[min(36rem,calc(100%-1rem))] grid-cols-[minmax(0,1fr)]">
      <DialogHeader className="pr-6">
        <DialogTitle className="break-words">
          {launched ? `Launching ${launched.name}` : "Quick setup"}
        </DialogTitle>
      </DialogHeader>

      <Stepper current={step} />

      {step === 0 && (
        <ConnectStep
          onContinue={(id, created) => {
            if (created) changed.current = true;
            setProjectId(id);
          }}
        />
      )}

      {step === 1 && (
        <ServerStep
          projectId={projectId}
          onBack={data ? undefined : () => setProjectId("")}
          onLaunched={(server) => {
            changed.current = true;
            setLaunched(server);
            // Picks up the new panel server in the session
            void update();
          }}
        />
      )}

      {launched && (
        <LaunchStep
          projectId={projectId}
          server={launched}
          onClose={() => closeModal?.()}
        />
      )}
    </ModalContent>
  );
}
