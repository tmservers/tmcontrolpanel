"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasPermissionSync } from "@/lib/utils";
import { routePermissions } from "@/routes";
import { HetznerProjectRole } from "@tmcontrolpanel/db";
import { useSession } from "next-auth/react";
import { useState } from "react";
import NewProjectForm from "./new-project-form";

const NEW_PROJECT = "new";

export default function ConnectStep({
  onContinue,
}: {
  onContinue: (projectId: string, created: boolean) => void;
}) {
  const { data: session } = useSession();
  const projects =
    session?.user.projects.filter((p) => p.role === HetznerProjectRole.Admin) ??
    [];
  const canCreate = hasPermissionSync(
    session,
    routePermissions.admin.hetzner.create,
  );

  // Decided once, so the session refresh after creating doesn't swap the form for the picker
  const [startedEmpty] = useState(() => projects.length === 0);
  const [creating, setCreating] = useState(false);

  if (startedEmpty && !canCreate) {
    return (
      <p className="text-sm text-muted-foreground">
        You don&apos;t have permission to create a Hetzner project. Ask a panel
        admin to add you to one.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!startedEmpty && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="quick-setup-project">Hetzner project</Label>
          <Select
            value={creating ? NEW_PROJECT : ""}
            onValueChange={(value) => {
              if (value === NEW_PROJECT) setCreating(true);
              else if (value) onContinue(value, false);
            }}
          >
            <SelectTrigger id="quick-setup-project" className="w-full">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent className="z-9999 max-w-[95vw]">
              {projects.map((project) => (
                <SelectItem
                  key={project.id}
                  value={project.id}
                  className="cursor-pointer"
                >
                  {project.name}
                </SelectItem>
              ))}
              {canCreate && (
                <SelectItem value={NEW_PROJECT} className="cursor-pointer">
                  Create a new project
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {(startedEmpty || creating) && (
        <NewProjectForm onCreated={(id) => onContinue(id, true)} />
      )}
    </div>
  );
}
