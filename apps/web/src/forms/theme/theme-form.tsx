"use client";

import ManialinkThemePreview from "@/components/theme/manialink-theme-preview";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/utils";
import { ServerError, ServerResponse } from "@/types/responses";
import { IconDeviceFloppy, IconRestore } from "@tabler/icons-react";
import { listThemePresets } from "@tmcontrolpanel/shared";
import { useState } from "react";
import { toast } from "sonner";

export default function ThemeForm({
  theme,
  inherited,
  inheritedLabel,
  allowInherit,
  onSave,
  callback,
}: {
  theme: string | null;
  inherited: string;
  inheritedLabel: string;
  allowInherit: boolean;
  onSave: (theme: { preset: string } | null) => Promise<ServerResponse>;
  callback?: () => void;
}) {
  const presets = listThemePresets();
  const [selected, setSelected] = useState(
    theme ?? (allowInherit ? "inherit" : inherited),
  );
  const [saving, setSaving] = useState(false);
  const effective = selected === "inherit" ? inherited : selected;

  async function save(value = selected) {
    setSaving(true);
    const next = value === "inherit" ? null : { preset: value };
    try {
      const { error } = await onSave(next);
      if (error) throw new ServerError(error, "UpdateThemeError");
      toast.success(next ? "Theme saved" : `Theme reset to ${inheritedLabel}`);
      callback?.();
    } catch (error) {
      toast.error("Failed to save theme", {
        description: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        {selected === "inherit"
          ? `Inherits ${inheritedLabel}.`
          : `Uses the ${presets.find((item) => item.id === selected)?.name ?? selected} preset.`}
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="theme-preset">
            Theme preset
          </label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger id="theme-preset" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowInherit && (
                <SelectItem value="inherit">
                  Inherit ({inheritedLabel})
                </SelectItem>
              )}
              {presets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected === "inherit" && (
            <p className="text-sm text-muted-foreground">
              Effective preset:{" "}
              {presets.find((item) => item.id === inherited)?.name ?? inherited}
            </p>
          )}
        </div>
        <ManialinkThemePreview preset={effective} />
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={() => void save()} disabled={saving}>
          <IconDeviceFloppy /> Save theme
        </Button>
        {allowInherit && theme !== null && selected !== "inherit" && (
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => {
              setSelected("inherit");
              void save("inherit");
            }}
          >
            <IconRestore /> Use {inheritedLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
