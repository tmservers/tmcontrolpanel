"use client";

import { deleteHetznerToken } from "@/actions/hetzner/tokens";
import ConfirmModal from "@/components/modals/confirm-modal";
import AddHetznerTokenModal from "@/components/modals/hetzner-tokens/add-hetzner-token";
import EditHetznerTokenModal from "@/components/modals/hetzner-tokens/edit-hetzner-token";
import ShareHetznerTokenModal from "@/components/modals/hetzner-tokens/share-hetzner-token";
import Modal from "@/components/modals/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMyHetznerTokens } from "@/hooks/use-hetzner-queries";
import { queryKeys } from "@/lib/api-client/query";
import { getErrorMessage } from "@/lib/utils";
import { ServerError } from "@/types/responses";
import {
  IconDots,
  IconExternalLink,
  IconPencil,
  IconPlus,
  IconShare,
  IconTrash,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

type Token = {
  id: string;
  name: string;
  tokenHint: string | null;
  groups: { id: string; name: string }[];
};

export default function HetznerTokens() {
  const tokens = useMyHetznerTokens();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Token | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Token | null>(null);
  const [modal, setModal] = useState<"add" | "edit" | "share" | null>(null);

  async function removeToken() {
    if (!confirmDelete) return;
    try {
      const { error } = await deleteHetznerToken(confirmDelete.id);
      if (error) throw new ServerError(error, "DeleteHetznerTokenError");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.hetznerTokens,
      });
      toast.success("Hetzner token deleted");
    } catch (error) {
      toast.error("Failed to delete Hetzner token", {
        description: getErrorMessage(error),
      });
    }
    setConfirmDelete(null);
  }

  return (
    <section
      aria-labelledby="hetzner-tokens-title"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2 id="hetzner-tokens-title" className="text-lg font-semibold">
          Hetzner Cloud
        </h2>
        <p className="text-sm text-muted-foreground">
          API tokens of your own Hetzner Cloud projects. Share a token with a
          group so its admins can deploy and manage servers on it; moderators
          can view them.
        </p>
      </div>
      {tokens.isPending ? (
        <p className="text-sm text-muted-foreground">Loading Hetzner tokens…</p>
      ) : tokens.error ? (
        <p role="alert" className="text-sm text-destructive">
          {getErrorMessage(tokens.error)}
        </p>
      ) : (
        <>
          {tokens.data.tokens.length === 0 ? (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">
                You haven’t added any Hetzner tokens yet.
                {!tokens.data.canAdd &&
                  " Adding tokens needs permission from a panel admin."}
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {tokens.data.tokens.map((token) => (
                <Card
                  key={token.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{token.name}</h3>
                      <span className="font-mono text-sm text-muted-foreground">
                        …{token.tokenHint ?? "????"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {token.groups.length ? (
                        token.groups.map((group) => (
                          <Badge key={group.id} variant="secondary">
                            {group.name}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">Not shared</Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Actions for ${token.name}`}
                      >
                        <IconDots />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/hetzner/${token.id}`}>
                          <IconExternalLink />
                          Open project
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          setSelected(token);
                          setModal("share");
                        }}
                      >
                        <IconShare />
                        Share with groups
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          setSelected(token);
                          setModal("edit");
                        }}
                      >
                        <IconPencil />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setConfirmDelete(token)}
                      >
                        <IconTrash />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Card>
              ))}
            </div>
          )}
          {tokens.data.canAdd && (
            <div>
              <Button onClick={() => setModal("add")}>
                <IconPlus />
                Add token
              </Button>
            </div>
          )}
          {modal === "add" && (
            <Modal isOpen setIsOpen={(open) => !open && setModal(null)}>
              <AddHetznerTokenModal />
            </Modal>
          )}
          {modal === "edit" && selected && (
            <Modal isOpen setIsOpen={(open) => !open && setModal(null)}>
              <EditHetznerTokenModal
                data={{ id: selected.id, name: selected.name }}
              />
            </Modal>
          )}
          {modal === "share" && selected && (
            <Modal isOpen setIsOpen={(open) => !open && setModal(null)}>
              <ShareHetznerTokenModal
                data={{
                  ...selected,
                  shareableGroups: tokens.data.shareableGroups,
                }}
              />
            </Modal>
          )}
          <ConfirmModal
            isOpen={!!confirmDelete}
            onClose={() => setConfirmDelete(null)}
            onConfirm={() => void removeToken()}
            title="Delete Hetzner token?"
            description="The servers keep running at Hetzner, but the panel stops managing them when this token is deleted."
            confirmText="Delete token"
            cancelText="Cancel"
          />
        </>
      )}
    </section>
  );
}
