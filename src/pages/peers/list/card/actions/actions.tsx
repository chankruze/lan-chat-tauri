import { RiChat1Fill, RiGamepadFill, RiShareFill } from "@remixicon/react";
import {
  connectToPeer,
  sendMessageToPeer,
  startWebSocketServer,
} from "@/services/ws"; // update path based on your actual file structure
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

export const actions = (peerInfo: PeerInfo): ActionType[] => [
  {
    id: "chat",
    icon: <RiChat1Fill className="size-8" />,
    label: "Start talking",
    iconWrapperStyles: "bg-red-100 text-red-600",
    tooltip: "Start a chat with this peer",
    action: async () => {
      console.log("Starting chat!");
      const wsAddr = peerInfo.metadata?.wsAddr;
      console.log(wsAddr);

      if (!wsAddr) return;

      try {
        await startWebSocketServer(); // ensure server is running
        await connectToPeer(wsAddr); // initiate connection
        await sendMessageToPeer(wsAddr, "👋 Hello from client!"); // send greeting
        console.log("Chat initiated with", peerInfo.metadata?.name);
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
      if (!wsAddr) return;

      try {
        await connectToPeer(wsAddr); // optional if already connected
        await sendMessageToPeer(
          wsAddr,
          "📁 File transfer feature coming soon!",
        );
        console.log("File transfer message sent to", peerInfo.metadata?.name);
      } catch (err) {
        console.error("Error sending file message:", err);
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
