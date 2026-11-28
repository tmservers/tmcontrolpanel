"use client";

import { addTrackmaniaServer } from "@/actions/hetzner/server-setup";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { getErrorMessage } from "@/lib/utils";
import type { HetznerDediServer } from "@/services/hetzner/servers";
import { ServerError } from "@/types/responses";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowNarrowLeft,
  IconLoader2,
  IconPlus,
} from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  TMServerSchema,
  TMServerSchemaType,
} from "../setup-steps/tm-server/tm-server-schema";
import ControllerFields, { cleanServerController } from "./controller-fields";
import CredentialFields from "./credential-fields";
import { LaunchedServer } from "./launch-step";
import PanelTargetFields, {
  GroupField,
  requireReplaceTarget,
  usePanelTargets,
} from "./panel-target-fields";

const AddServerSchema = TMServerSchema.superRefine(requireReplaceTarget);

export default function AddServerForm({
  projectId,
  machine,
  onBack,
  onLaunched,
}: {
  projectId: string;
  machine: HetznerDediServer;
  onBack: () => void;
  onLaunched: (server: LaunchedServer) => void;
}) {
  const { groups, servers } = usePanelTargets();

  const form = useForm<TMServerSchemaType>({
    resolver: zodResolver(AddServerSchema),
    defaultValues: {
      dediLogin: "",
      dediPassword: "",
      roomPassword: "",
      createServer: true,
      updateServer: false,
      groupId: groups.length === 1 ? groups[0].id : "",
      serverId: "",
    },
  });

  async function onSubmit(values: TMServerSchemaType) {
    try {
      const { data, error } = await addTrackmaniaServer(projectId, machine.id, {
        ...values,
        newGroup: true,
        serverController: cleanServerController(values.serverController),
      });
      if (error) {
        throw new ServerError(error, "AddTrackmaniaServerError");
      }
      toast.success("Server successfully added");
      // Also covers a panel server that was saved but couldn't be added to its group
      if (data.panelServerError) {
        toast.warning("The panel server wasn't fully set up", {
          description: data.panelServerError,
        });
      }
      onLaunched({
        hetznerServerId: machine.id,
        panelServerId: data.panelServerId,
        panelServerError: data.panelServerError,
        name: data.name,
        machineName: machine.name,
      });
    } catch (error) {
      toast.error("Failed to add server", {
        description: getErrorMessage(error),
      });
    }
  }

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex min-w-0 flex-col gap-4"
      >
        <p className="text-sm break-words text-muted-foreground">
          Adding to {[machine.name, machine.ip].filter(Boolean).join(" · ")}
        </p>

        <CredentialFields />
        <ControllerFields />
        <PanelTargetFields servers={servers} />
        <GroupField groups={groups} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
          >
            <IconArrowNarrowLeft />
            Back
          </Button>
          <Button
            type="submit"
            className="h-auto min-h-9 whitespace-normal sm:ml-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              <IconPlus />
            )}
            {isSubmitting
              ? "Adding server… this can take a minute"
              : "Add server"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
