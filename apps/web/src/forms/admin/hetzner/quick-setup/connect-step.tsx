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
import { useState, type ComponentProps } from "react";
import MachineChoice, { ServerTarget } from "./machine-choice";
import NewProjectForm from "./new-project-form";

const NEW_PROJECT = "new";

function ConnectStepInner({
  fixedProjectId,
  initialProjectId,
  initialTarget,
  onContinue,
}: {
  // Set when the wizard was opened from a project, which hides the picker
  fixedProjectId?: string;
  initialProjectId: string;
  initialTarget: ServerTarget;
  onContinue: (
    projectId: string,
    target: ServerTarget,
    created: boolean,
  ) => void;
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
  const [projectId, setProjectId] = useState(initialProjectId);
  const selected = projects.some((p) => p.id === projectId) ? projectId : "";

  if (fixedProjectId) {
    return (
      <MachineChoice
        projectId={fixedProjectId}
        initialTarget={initialTarget}
        onContinue={(target) => onContinue(fixedProjectId, target, false)}
      />
    );
  }

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
            value={creating ? NEW_PROJECT : selected}
            onValueChange={(value) => {
              if (!value) return;
              setCreating(value === NEW_PROJECT);
              if (value !== NEW_PROJECT) setProjectId(value);
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
        <NewProjectForm onCreated={(id) => onContinue(id, "new", true)} />
      )}

      {!startedEmpty && !creating && selected && (
        <MachineChoice
          key={selected}
          projectId={selected}
          initialTarget={initialTarget}
          onContinue={(target) => onContinue(selected, target, false)}
        />
      )}
    </div>
  );
}

// The picker decides between "new project" and "existing" once, so it must see a loaded session
export default function ConnectStep(
  props: ComponentProps<typeof ConnectStepInner>,
) {
  const { status } = useSession();
  if (status === "loading") {
    return <span className="text-sm text-muted-foreground">Loading...</span>;
  }
  return <ConnectStepInner {...props} />;
}
