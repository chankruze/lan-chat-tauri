import { Dialog } from "@/components/dialog";
import { Drawer } from "@/components/drawer";
import { PeerInfo } from "@/types/peer";
import { RiChat1Fill, RiGamepadFill, RiShareFill } from "@remixicon/react";
import { Action } from "./action";
import { Divider } from "@/components/divider";
import useMediaQuery from "@/hooks/useMediaQuery";

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

  const actions = [
    {
      id: "chat",
      icon: <RiChat1Fill className="size-8" />,
      label: "Start talking",
      action: () => console.log("Chat with", peerInfo.metadata?.name),
      iconWrapperStyles: "bg-red-100 text-red-600",
      tooltip: "Start a chat with this peer",
    },
    {
      id: "file",
      icon: <RiShareFill className="size-8" />,
      label: "Send files",
      action: () => console.log("Share file with", peerInfo.metadata?.name),
      iconWrapperStyles: "bg-green-100 text-green-600",
    },
    {
      id: "game",
      icon: <RiGamepadFill className="size-8" />,
      label: "Play games",
      action: () => console.log("Play game with", peerInfo.metadata?.name),
      iconWrapperStyles: "bg-blue-100 text-blue-600",
      tooltip: "Play a game with this peer",
      disabled: true,
    },
  ];

  const content = (
    <div className="space-y-4 divide-neutral-100">
      <div className="space-y-1 text-center">
        <p className="font-medium">{peerInfo.metadata?.name}</p>
        <p className="text-xs text-neutral-500">
          {peerInfo.metadata?.instance}
        </p>
        <p className="text-xs text-neutral-400">{peerInfo.metadata?.addr}</p>
      </div>
      <Divider />
      <div className="grid grid-cols-3 gap-6">
        {actions.map((action) => (
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
