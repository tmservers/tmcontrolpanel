"use client";

import FormElement from "@/components/form/form-element";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { hasPermissionSync } from "@/lib/utils";
import { routePermissions } from "@/routes";
import { UserGroup, UserServer } from "@/types/auth";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import z from "zod";
import { TMServerSchemaType } from "../setup-steps/tm-server/tm-server-schema";

type PanelTarget = Pick<
  TMServerSchemaType,
  "createServer" | "updateServer" | "groupId" | "serverId"
>;

export function requireReplaceTarget(
  values: PanelTarget,
  ctx: z.RefinementCtx,
) {
  if (values.updateServer && !values.serverId) {
    ctx.addIssue({
      code: "custom",
      path: ["serverId"],
      message: "Select the panel server to replace",
    });
  }
}

// Only targets the setup actions will accept
export function usePanelTargets() {
  const { data: session } = useSession();
  const groups =
    session?.user.groups.filter((g) =>
      hasPermissionSync(session, routePermissions.admin.groups.edit, g.id),
    ) ?? [];
  const servers =
    session?.user.servers.filter((s) =>
      hasPermissionSync(session, routePermissions.admin.servers.edit, s.id),
    ) ?? [];
  return { groups, servers };
}

export default function PanelTargetFields({
  servers,
}: {
  servers: UserServer[];
}) {
  const form = useFormContext<PanelTarget>();
  const replace = form.watch("updateServer");

  return (
    <div className="flex flex-col gap-3">
      <RadioGroup
        aria-label="Panel server"
        value={replace ? "replace" : "create"}
        onValueChange={(value) => {
          form.setValue("createServer", value === "create");
          form.setValue("updateServer", value === "replace");
          form.clearErrors("serverId");
        }}
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem id="quick-setup-create" value="create" />
          <Label htmlFor="quick-setup-create">Create a new panel server</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem
            id="quick-setup-replace"
            value="replace"
            disabled={servers.length === 0}
          />
          <Label htmlFor="quick-setup-replace">
            Replace an existing panel server
          </Label>
        </div>
      </RadioGroup>

      {replace && (
        <FormElement
          name="serverId"
          label="Panel server to replace"
          placeholder="Select a server"
          type="select"
          options={servers.map((s) => ({ label: s.name, value: s.id }))}
          rootClassName="max-w-full"
        />
      )}
    </div>
  );
}

export function GroupField({ groups }: { groups: UserGroup[] }) {
  const form = useFormContext<PanelTarget>();
  const [clears, setClears] = useState(0);
  const groupId = form.watch("groupId");
  const createServer = form.watch("createServer");

  if (!createServer) return null;

  // Without a pick the backend creates a group named after the server
  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        The server will be added to a new group named after it.
      </p>
    );
  }

  return (
    <FormElement
      // Remounted when cleared, so the placeholder comes back
      key={`group-${clears}`}
      name="groupId"
      label="Add to group"
      placeholder="New group"
      type="select"
      options={groups.map((g) => ({ label: g.name, value: g.id }))}
      onClear={
        groupId
          ? () => {
              form.setValue("groupId", "");
              setClears((v) => v + 1);
            }
          : undefined
      }
      rootClassName="max-w-full"
    />
  );
}
