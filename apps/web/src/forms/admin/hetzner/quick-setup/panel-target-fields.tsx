"use client";

import FormElement from "@/components/form/form-element";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserServer } from "@/types/auth";
import { useFormContext } from "react-hook-form";
import { SimpleServerSetupSchemaType } from "../setup-steps/simple/server-setup-schema";

export default function PanelTargetFields({
  servers,
}: {
  servers: UserServer[];
}) {
  const form = useFormContext<SimpleServerSetupSchemaType>();
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
