"use client";

import { createSimpleServerSetup } from "@/actions/hetzner/server-setup";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  defaultServerTypeId,
  serverNameFromLogin,
} from "@/lib/hetzner-defaults";
import { getErrorMessage } from "@/lib/utils";
import { HetznerLocation } from "@/types/api/hetzner/locations";
import { HetznerServerType } from "@/types/api/hetzner/servers";
import { HetznerSSHKey } from "@/types/api/hetzner/ssh-keys";
import { ServerError } from "@/types/responses";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowNarrowLeft,
  IconLoader2,
  IconRocket,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  SimpleServerSetupSchema,
  SimpleServerSetupSchemaType,
} from "../setup-steps/simple/server-setup-schema";
import ControllerFields, { cleanServerController } from "./controller-fields";
import CredentialFields from "./credential-fields";
import CustomizeFields from "./customize-fields";
import { LaunchedServer } from "./launch-step";
import PanelTargetFields, {
  requireReplaceTarget,
  usePanelTargets,
} from "./panel-target-fields";

const QuickServerSchema =
  SimpleServerSetupSchema.superRefine(requireReplaceTarget);

export default function ServerForm({
  projectId,
  locations,
  serverTypes,
  sshKeys,
  onBack,
  onLaunched,
}: {
  projectId: string;
  locations: HetznerLocation[];
  serverTypes: HetznerServerType[];
  sshKeys: HetznerSSHKey[];
  onBack: () => void;
  onLaunched: (server: LaunchedServer) => void;
}) {
  const { groups, servers: panelServers } = usePanelTargets();

  const defaultLocation =
    locations.find((l) => l.name === "fsn1")?.name ?? locations[0]?.name ?? "";

  const form = useForm<SimpleServerSetupSchemaType>({
    resolver: zodResolver(QuickServerSchema),
    defaultValues: {
      server: {
        name: serverNameFromLogin(""),
        serverType: defaultServerTypeId(serverTypes, defaultLocation),
        location: defaultLocation,
        sshKeys: [],
        dediLogin: "",
        dediPassword: "",
        roomPassword: "",
        controller: false,
      },
      createServer: true,
      updateServer: false,
      groupId: groups.length === 1 ? groups[0].id : "",
      serverId: "",
    },
  });

  const [customize, setCustomize] = useState(false);
  const [notice, setNotice] = useState<string>();
  // Bumped to remount the type select, which doesn't follow programmatic changes
  const [typeVersion, setTypeVersion] = useState(0);
  const nameEdited = useRef(false);

  const login = form.watch("server.dediLogin");
  const locationName = form.watch("server.location");
  const typeId = form.watch("server.serverType");

  useEffect(() => {
    if (nameEdited.current) return;
    form.setValue("server.name", serverNameFromLogin(login));
  }, [login, form]);

  useEffect(() => {
    setNotice(undefined);
    const current = serverTypes.find(
      (t) => t.id.toString() === form.getValues("server.serverType"),
    );
    if (current?.prices.some((p) => p.location === locationName)) return;

    const nextId = defaultServerTypeId(serverTypes, locationName);
    const next = serverTypes.find((t) => t.id.toString() === nextId);
    if (!next || next.id === current?.id) return;
    form.setValue("server.serverType", nextId);
    setTypeVersion((v) => v + 1);
    if (current) {
      setNotice(
        `${current.name} isn't available in this location, switched to ${next.name}.`,
      );
    }
  }, [locationName, serverTypes, form]);

  const serverType = serverTypes.find((t) => t.id.toString() === typeId);
  const location = locations.find((l) => l.name === locationName);
  const monthly = serverType?.prices.find((p) => p.location === locationName)
    ?.price_monthly.gross;
  const price = monthly ? `€${Number(monthly).toFixed(2)}/mo` : null;

  async function onSubmit(values: SimpleServerSetupSchemaType) {
    try {
      const controller = cleanServerController(values.serverController);
      const { data, error } = await createSimpleServerSetup(projectId, {
        ...values,
        newGroup: true,
        server: { ...values.server, controller: !!controller },
        serverController: controller,
        // The backend fills in the database type and credentials
        database: controller ? { new: true, local: true } : undefined,
      });
      if (error) {
        throw new ServerError(error, "CreateSimpleServerSetupError");
      }
      toast.success("Server setup successfully created");
      // Also covers a panel server that was saved but couldn't be added to its group
      if (data.panelServerError) {
        toast.warning("The panel server wasn't fully set up", {
          description: data.panelServerError,
        });
      }
      onLaunched({
        hetznerServerId: data.server.id,
        panelServerId: data.panelServerId,
        panelServerError: data.panelServerError,
        name: data.server.name,
      });
    } catch (error) {
      toast.error("Failed to create server setup", {
        description: getErrorMessage(error),
      });
    }
  }

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          // Don't leave an error hidden inside the collapsed section
          const server = errors.server;
          if (server?.name || server?.serverType || server?.location) {
            setCustomize(true);
          }
        })}
        className="flex min-w-0 flex-col gap-4"
      >
        <CredentialFields prefix="server." />

        <div className="flex flex-col gap-1 rounded-md border bg-muted/50 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="text-muted-foreground">
            {serverType
              ? `${serverType.name} · ${serverType.cores} vCPU · ${serverType.memory} GB · ${location?.city ?? locationName}`
              : "No server type available"}
          </span>
          <span className="font-semibold tabular-nums">
            {price ?? "Price unavailable"}
          </span>
        </div>

        <ControllerFields />

        <CustomizeFields
          open={customize}
          onOpenChange={setCustomize}
          onNameEdit={() => (nameEdited.current = true)}
          typeVersion={typeVersion}
          locations={locations}
          serverTypes={serverTypes}
          sshKeys={sshKeys}
          groups={groups}
        />

        {notice && (
          <p role="status" className="text-sm text-muted-foreground">
            {notice}
          </p>
        )}

        <PanelTargetFields servers={panelServers} />

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
            className="sm:ml-auto"
            disabled={!price || isSubmitting}
          >
            {isSubmitting ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              <IconRocket />
            )}
            {isSubmitting
              ? "Launching..."
              : `Launch server${price ? ` · ${price}` : ""}`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
