import { RiChat1Fill, RiGamepadFill, RiShareFill } from "@remixicon/react";
import { PeerInfo } from "@/types/peer";
import routes from "@/routes";

export type ActionType = {
  id: string;
  icon: JSX.Element;
  label: string;
  iconWrapperStyles: string;
  tooltip?: string;
  disabled?: boolean;
  action: () => void | Promise<void>;
};

interface ActionCallbacks {
  onClose: () => void;
  navigate: (path: string) => void;
  connectToPeer: (
    peerId: string,
    peerAddress: string,
  ) => Promise<void>;
}

export const actions = (
  peerInfo: PeerInfo,
  callbacks: ActionCallbacks,
): ActionType[] => {
  const { onClose, navigate, connectToPeer } = callbacks;

  return [
    {
      id: "chat",
      icon: <RiChat1Fill className="size-8" />,
      label: "Start talking",
      iconWrapperStyles: "bg-red-100 text-red-600",
      tooltip: "Start a chat with this peer",
      action: async () => {
        console.log("Starting chat!");
        const wsAddr = peerInfo.metadata?.wsAddr;
        const peerName = peerInfo.metadata?.name || "Unknown Peer";

        if (!wsAddr) {
          console.error("No WebSocket address found for peer");
          return;
        }

        try {
          // Connect to peer
          await connectToPeer(peerInfo.id, wsAddr);

          // Close action menu and navigate to chat
          onClose();
          navigate(routes.peers.peer.chat.path(peerInfo.id));

          console.log("Chat initiated with", peerName);
        } catch (err) {
          console.error("Error during chat initiation:", err);
        }
      },
    },
    {
      id: "file",
      icon: <RiShareFill className="size-8" />,
      label: "Send files",
      iconWrapperStyles: "bg-green-100 text-green-600",
      tooltip: "Send a file to this peer",
      action: async () => {
        const wsAddr = peerInfo.metadata?.wsAddr;
        const peerName = peerInfo.metadata?.name || "Unknown Peer";

        if (!wsAddr) {
          console.error("No WebSocket address found for peer");
          return;
        }

        try {
          // Connect to peer first
          await connectToPeer(peerInfo.id, wsAddr);

          // Close action menu and navigate to chat
          onClose();
          navigate(routes.peers.peer.chat.path(peerInfo.id));

          console.log("File transfer initiated with", peerName);
        } catch (err) {
          console.error("Error during file transfer initiation:", err);
        }
      },
    },
    {
      id: "game",
      icon: <RiGamepadFill className="size-8" />,
      label: "Play games",
      iconWrapperStyles: "bg-blue-100 text-blue-600",
      tooltip: "Play a game with this peer",
      disabled: true,
      action: () => {}, // noop
    },
  ];
};
