"use client";

import FormElement from "@/components/form/form-element";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useFormContext, useWatch } from "react-hook-form";
import z from "zod";
import { ServerControllerSchema } from "../setup-steps/simple/server-controller-schema";

type ServerController = z.infer<typeof ServerControllerSchema>;
type ControllerValues = { serverController?: ServerController };

const NONE = "none";

const CONTROLLERS: { value: ServerController["type"]; label: string }[] = [
  { value: "evosc", label: "EvoSC" },
  { value: "maniacontrol", label: "ManiaControl" },
  { value: "minicontrol", label: "MiniControl" },
  { value: "pyplanet", label: "PyPlanet" },
];

function newController(
  type: ServerController["type"],
  admins: string[],
): ServerController {
  switch (type) {
    case "evosc":
      return { type };
    case "minicontrol":
      return {
        type,
        admins,
        excludedPlugins: [],
        contactInfo: "",
        identifier: "",
        secret: "",
      };
    default:
      return { type, admins };
  }
}

const filled = (values: string[]) =>
  values.map((v) => v.trim()).filter(Boolean);

// Drops list rows the user added but left empty
export function cleanServerController(
  controller?: ServerController,
): ServerController | undefined {
  if (!controller || controller.type === "evosc") return controller;
  if (controller.type === "minicontrol") {
    return {
      ...controller,
      admins: filled(controller.admins),
      excludedPlugins: filled(controller.excludedPlugins),
    };
  }
  return { ...controller, admins: filled(controller.admins) };
}

export default function ControllerFields() {
  const { data: session } = useSession();
  const form = useFormContext<ControllerValues>();
  const type = useWatch({
    control: form.control,
    name: "serverController.type",
  });

  function onTypeChange(value: string) {
    const next = CONTROLLERS.find((c) => c.value === value)?.value;
    // Radix can report an empty value, which must not clear the choice
    if (!next && value !== NONE) return;

    const current = form.getValues("serverController");
    const login = session?.user.login;
    const admins =
      current && "admins" in current ? current.admins : login ? [login] : [""];
    form.setValue(
      "serverController",
      next ? newController(next, admins) : undefined,
    );
    form.clearErrors("serverController");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="quick-setup-controller">Server controller</Label>
        <Select value={type ?? NONE} onValueChange={onTypeChange}>
          <SelectTrigger id="quick-setup-controller" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-9999 max-w-[95vw]">
            <SelectItem value={NONE} className="cursor-pointer">
              None
            </SelectItem>
            {CONTROLLERS.map((c) => (
              <SelectItem
                key={c.value}
                value={c.value}
                className="cursor-pointer"
              >
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Runs next to the server with its own database.
        </p>
      </div>

      {type && type !== "evosc" && (
        <StringList
          name="serverController.admins"
          label="Admins"
          item="admin"
          placeholder="Enter admin login"
        />
      )}

      {type === "minicontrol" && (
        <>
          <FormElement
            name="serverController.contactInfo"
            label="Contact info"
            description="Contact information so Nadeo can reach you"
            rootClassName="max-w-full"
            isRequired
          />
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <FormElement
              name="serverController.identifier"
              label="Identifier"
              placeholder="Trackmania API identifier"
              rootClassName="max-w-full"
            />
            <FormElement
              name="serverController.secret"
              label="Secret"
              placeholder="Trackmania API secret"
              type="password"
              rootClassName="max-w-full"
            />
          </div>
          <StringList
            name="serverController.excludedPlugins"
            label="Excluded plugins"
            item="plugin"
            placeholder="Enter plugin name"
          />
        </>
      )}
    </div>
  );
}

function StringList({
  name,
  label,
  item,
  placeholder,
}: {
  name: "serverController.admins" | "serverController.excludedPlugins";
  label: string;
  item: string;
  placeholder: string;
}) {
  const form = useFormContext<ControllerValues>();
  const values = useWatch({ control: form.control, name }) ?? [];

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      {values.map((_, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <FormElement
              name={`${name}.${index}`}
              placeholder={placeholder}
              rootClassName="max-w-full"
              className="w-full"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() =>
              form.setValue(
                name,
                form.getValues(name)?.filter((_, i) => i !== index) ?? [],
              )
            }
          >
            <IconTrash />
            <span className="sr-only">
              Remove {item} {index + 1}
            </span>
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() =>
          form.setValue(name, [...(form.getValues(name) ?? []), ""])
        }
      >
        <IconPlus />
        Add {item}
      </Button>
    </fieldset>
  );
}
