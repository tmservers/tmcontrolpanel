"use client";

import { deleteServer } from "@/actions/database/servers";
import ConfirmModal from "@/components/modals/confirm-modal";
import Modal from "@/components/modals/modal";
import EditServerModal from "@/components/modals/servers/edit-server";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage, hasPermissionSync } from "@/lib/utils";
import { routePermissions } from "@/routes";
import type { ServersWithUsers } from "@/services/database/servers";
import { ServerError } from "@/types/responses";
import { MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useState, useTransition } from "react";
import { toast } from "sonner";

// The edit modal state lives with the caller so a card click can open it too
export default function ServerActionsMenu({
  server,
  refetch,
  editIsOpen,
  setEditIsOpen,
}: {
  server: ServersWithUsers;
  refetch: () => void;
  editIsOpen: boolean;
  setEditIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { data: session } = useSession();
  const [, startTransition] = useTransition();
  const [deleteIsOpen, setDeleteIsOpen] = useState(false);

  const canEdit = hasPermissionSync(
    session,
    routePermissions.admin.servers.edit,
    server.id,
  );
  const canDelete = hasPermissionSync(
    session,
    routePermissions.admin.servers.delete,
    server.id,
  );

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const { error } = await deleteServer(server.id);
        if (error) {
          throw new ServerError(error, "DeleteServerError");
        }
        refetch();
        toast.success("Server successfully deleted");
      } catch (error) {
        toast.error("Error deleting server", {
          description: getErrorMessage(error),
        });
      }
    });
  };

  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu for {server.name}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit && (
            <DropdownMenuItem onClick={() => setEditIsOpen(true)}>
              Edit server
            </DropdownMenuItem>
          )}
          {canEdit && canDelete && <DropdownMenuSeparator />}
          {canDelete && (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteIsOpen(true)}
            >
              Delete server
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canDelete && (
        <ConfirmModal
          isOpen={deleteIsOpen}
          onClose={() => setDeleteIsOpen(false)}
          onConfirm={handleDelete}
          title="Delete server"
          description={`Are you sure you want to delete ${server.name}?`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {canEdit && (
        <Modal
          isOpen={editIsOpen}
          setIsOpen={setEditIsOpen}
          closeOnBackdropClick={false}
        >
          <EditServerModal data={server} onSubmit={refetch} />
        </Modal>
      )}
    </>
  );
}
