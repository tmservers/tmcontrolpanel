"use client";

import { deleteHetznerToken } from "@/actions/hetzner/tokens";
import ConfirmModal from "@/components/modals/confirm-modal";
import EditHetznerTokenModal from "@/components/modals/hetzner-tokens/edit-hetzner-token";
import ShareHetznerTokenModal from "@/components/modals/hetzner-tokens/share-hetzner-token";
import Modal from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMyHetznerTokens } from "@/hooks/use-hetzner-queries";
import { queryKeys } from "@/lib/api-client/query";
import { generatePath, getErrorMessage } from "@/lib/utils";
import { routes } from "@/routes";
import type { HetznerProjectListItem } from "@/services/database/hetzner-projects";
import { ServerError } from "@/types/responses";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function HetznerProjectActionsMenu({
  project,
  refetch,
}: {
  project: HetznerProjectListItem;
  refetch: () => void;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<"edit" | "share" | "delete" | null>(null);

  // Matches the server rule: only the owner or a super admin manages the token
  const canManage =
    !!session && (project.owner?.id === session.user.id || session.user.admin);
  const tokens = useMyHetznerTokens(canManage);
  const groups = project.groupHetznerProjects.map((g) => g.group);

  // The token forms refresh the settings query; this table has its own
  const close = () => {
    setModal(null);
    refetch();
  };

  const handleDelete = async () => {
    try {
      const { error } = await deleteHetznerToken(project.id);
      if (error) throw new ServerError(error, "DeleteHetznerTokenError");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.hetznerTokens,
      });
      toast.success("Hetzner token deleted");
      close();
    } catch (error) {
      toast.error("Failed to delete Hetzner token", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu for {project.name}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={generatePath(routes.admin.hetznerServers, {
                id: project.id,
              })}
            >
              View project
            </Link>
          </DropdownMenuItem>
          {canManage && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setModal("share")}>
                Share with groups
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setModal("edit")}>
                Edit token
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setModal("delete")}
              >
                Delete token
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {modal === "edit" && (
        <Modal isOpen setIsOpen={(open) => !open && close()}>
          <EditHetznerTokenModal
            data={{ id: project.id, name: project.name }}
          />
        </Modal>
      )}

      {modal === "share" && (
        <Modal isOpen setIsOpen={(open) => !open && close()}>
          <ShareHetznerTokenModal
            data={{
              id: project.id,
              name: project.name,
              groups,
              shareableGroups: tokens.data?.shareableGroups ?? [],
            }}
          />
        </Modal>
      )}

      <ConfirmModal
        isOpen={modal === "delete"}
        onClose={() => setModal(null)}
        onConfirm={handleDelete}
        title="Delete Hetzner token"
        description={`Delete ${project.name}? Its servers keep running at Hetzner, but the panel stops managing them.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
