import { Dialog } from "@/components/dialog";
import { Drawer } from "@/components/drawer";
import { PeerInfo } from "@/types/peer";
import { Action } from "./action";
import { Divider } from "@/components/divider";
import { actions, ActionType } from "./actions";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useChat } from "@/context/ChatContext";
import { useNavigate } from "react-router";

export const Actions = ({
  peerInfo,
  open,
  onClose,
}: {
  peerInfo: PeerInfo;
  open: boolean;
  onClose: () => void;
}) => {
  const isSmUp = useMediaQuery("(min-width: 640px)");
  const { connectToPeer } = useChat();
  const navigate = useNavigate();

  const actionItems = actions(peerInfo, { onClose, navigate, connectToPeer });

  const content = (
    <div className="space-y-4 divide-neutral-100">
      <div className="space-y-1 text-center">
        <p className="font-medium">{peerInfo.metadata?.name}</p>
        <p className="text-xs text-neutral-500">
          {peerInfo.metadata?.instance}
        </p>
        <p className="text-xs text-neutral-400">
          {peerInfo.metadata?.mdnsAddr}
        </p>
      </div>
      <Divider />
      <div className="grid grid-cols-3 gap-6">
        {actionItems.map((action: ActionType) => (
          <Action key={action.id} {...action} />
        ))}
      </div>
    </div>
  );

  return isSmUp ? (
    <Dialog open={open} onClose={onClose}>
      {content}
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={onClose}>
      {content}
    </Drawer>
  );
};
