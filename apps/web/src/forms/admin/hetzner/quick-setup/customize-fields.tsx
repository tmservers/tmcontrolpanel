"use client";

import FormElement from "@/components/form/form-element";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { HetznerLocation } from "@/types/api/hetzner/locations";
import { HetznerServerType } from "@/types/api/hetzner/servers";
import { HetznerSSHKey } from "@/types/api/hetzner/ssh-keys";
import { UserGroup } from "@/types/auth";
import { IconChevronRight } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { SimpleServerSetupSchemaType } from "../setup-steps/simple/server-setup-schema";
import { GroupField } from "./panel-target-fields";

export default function CustomizeFields({
  open,
  onOpenChange,
  onNameEdit,
  typeVersion,
  locations,
  serverTypes,
  sshKeys,
  groups,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNameEdit: () => void;
  typeVersion: number;
  locations: HetznerLocation[];
  serverTypes: HetznerServerType[];
  sshKeys: HetznerSSHKey[];
  groups: UserGroup[];
}) {
  const form = useFormContext<SimpleServerSetupSchemaType>();
  const location = form.watch("server.location");
  const typeId = form.watch("server.serverType");

  // The selected type stays listed until it has been swapped for one sold here
  const typeOptions = serverTypes
    .filter(
      (type) =>
        type.id.toString() === typeId ||
        type.prices.some((p) => p.location === location),
    )
    .map((type) => ({
      value: type.id.toString(),
      label: `${type.name} · ${type.cores} vCPU · ${type.memory} GB`,
    }));

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <IconChevronRight
            className={cn("transition-transform", open && "rotate-90")}
          />
          Customize
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="grid items-start gap-4 pt-3 sm:grid-cols-2">
        <div onChange={onNameEdit}>
          <FormElement
            name="server.name"
            label="Server name"
            placeholder="Enter server name"
            rootClassName="max-w-full"
          />
        </div>
        <FormElement
          key={`type-${typeVersion}`}
          name="server.serverType"
          label="Server type"
          placeholder="Select server type"
          type="select"
          options={typeOptions}
          rootClassName="max-w-full"
        />
        <FormElement
          name="server.location"
          label="Location"
          placeholder="Select location"
          type="select"
          options={locations.map((l) => ({
            value: l.name,
            label: l.description,
          }))}
          rootClassName="max-w-full"
        />
        <FormElement
          name="server.sshKeys"
          label="SSH keys"
          placeholder="Select SSH keys"
          type="multi-select"
          options={sshKeys.map((key) => ({
            label: key.name,
            value: key.id.toString(),
          }))}
          rootClassName="max-w-full min-w-0"
        />
        <GroupField groups={groups} />
      </CollapsibleContent>
    </Collapsible>
  );
}
