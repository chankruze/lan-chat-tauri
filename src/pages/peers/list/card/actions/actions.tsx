import { RiChat1Fill, RiGamepadFill, RiShareFill } from "@remixicon/react";
import { PeerInfo } from "@/types/peer";

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
  onChatOpen: () => void;
  startChat: (peerId: string, peerName: string, peerAddress: string) => Promise<void>;
}

export const actions = (peerInfo: PeerInfo, callbacks: ActionCallbacks): ActionType[] => {
  const { onClose, onChatOpen, startChat } = callbacks;
  
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
          // Use chat context to start chat
          await startChat(peerInfo.id, peerName, wsAddr);
          
          // Close action menu and open chat window
          onClose();
          onChatOpen();
          
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
          // Start chat session first
          await startChat(peerInfo.id, peerName, wsAddr);
          
          // Close action menu and open chat window
          onClose();
          onChatOpen();
          
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
