"use client";
import ConfirmModal from "@/components/modals/confirm-modal";
import { ModalContent } from "@/components/modals/modal";
import { MasterNodeEnumType } from "@/components/tournaments/competitions/graph/competition-graph";
import { LeaderboardV2NodeType } from "@/components/tournaments/competitions/graph/nodes/leaderboard-node";
import { MatchV1NodeType } from "@/components/tournaments/competitions/graph/nodes/match-node";
import { RegistrationV1NodeType } from "@/components/tournaments/competitions/graph/nodes/registration-node";
import { ServerV1NodeType } from "@/components/tournaments/competitions/graph/nodes/server-node";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerAction } from "@/hooks/tournaments/use-server-action";
import { toNodeHandle } from "@/lib/node-handle";
import { reducers } from "@/lib/server-manager";
import { IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useReducer } from "spacetimedb/react";
import { DefaultModalProps } from "../../default-props";
import LeaderboardSettings from "./settings/leaderboard-settings";
import MatchSettings from "./settings/match-settings";
import RegistrationSettings from "./settings/registration-settings";
import ServerSettings from "./settings/server-settings";

// General settings shared by every node type, followed by the type specific ones.
export default function NodeSettingsModal({
  data: node,
  closeModal,
}: DefaultModalProps<MasterNodeEnumType>) {
  const [name, setName] = useState(node?.data.name ?? "");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const rename = useServerAction(
    useReducer(reducers.nodeNameEdit),
    "Failed to rename node",
    "Node renamed",
  );
  const remove = useServerAction(
    useReducer(reducers.nodeDelete),
    "Failed to delete node",
    "Node deleted",
  );

  if (!node) return null;
  const data = { handle: toNodeHandle(node.id), name: node.data.name };

  return (
    <ModalContent className="gap-4 sm:min-w-100">
      <DialogHeader className="pr-6">
        <DialogTitle>{data.name}</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        <Label>Name</Label>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Button
            disabled={!name || name === data.name}
            onClick={() => rename({ node: data.handle, name })}
          >
            <IconDeviceFloppy />
            Save
          </Button>
        </div>
      </div>

      {node.type === "MatchV1" && (
        <MatchSettings match={(node as MatchV1NodeType).data} />
      )}
      {node.type === "RegistrationV1" && (
        <RegistrationSettings
          registration={(node as RegistrationV1NodeType).data}
        />
      )}
      {node.type === "LeaderboardV2" && (
        <LeaderboardSettings
          leaderboard={(node as LeaderboardV2NodeType).data}
        />
      )}
      {node.type === "ServerV1" && (
        <ServerSettings server={(node as ServerV1NodeType).data} />
      )}

      <Button
        variant="destructive"
        className="self-start mt-2"
        onClick={() => setIsDeleteOpen(true)}
      >
        <IconTrash />
        Delete
      </Button>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          setIsDeleteOpen(false);
          if (await remove({ node: data.handle })) closeModal?.();
        }}
        title="Delete node"
        description={`Are you sure you want to delete ${data.name}? Its connections are removed as well.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </ModalContent>
  );
}
