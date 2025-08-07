import { useState } from "react";
import { PeerInfo } from "@/types/peer";
import { platformIcon } from "@/utils/platform-icons";
import { Actions } from "./actions";
import { useChat } from "@/context/ChatContext";
import { useNavigate } from "react-router";
import routes from "@/routes";

interface PeerCardProps {
  peerInfo: PeerInfo;
}

export const Card = ({ peerInfo }: PeerCardProps) => {
  const [open, setOpen] = useState(false);
  const { getUnreadCount, sessions } = useChat();
  const navigate = useNavigate();
  
  const unreadCount = getUnreadCount(peerInfo.id);
  const hasActiveChat = sessions[peerInfo.id]?.isActive;

  const handleCardClick = () => {
    // If there's an active chat or unread messages, navigate to chat directly
    if (hasActiveChat || unreadCount > 0) {
      navigate(routes.peers.peer.chat.path(peerInfo.id));
    } else {
      // Otherwise, show action menu
      setOpen(true);
    }
  };

  console.log(peerInfo);

  return (
    <>
      <div
        onClick={handleCardClick}
        className="w-full h-full p-3 space-y-1 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer rounded-lg bg-white border border-neutral-200 text-sm relative"
      >
        {/* Unread message badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
        
        {/* Active chat indicator */}
        {hasActiveChat && (
          <div className="absolute top-2 left-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        )}
        
        <div className="flex items-center justify-between gap-4">
          <p className="font-semibold text-neutral-800 truncate flex-1">
            {peerInfo.metadata?.name || "Unknown Peer"}
          </p>
          {platformIcon(peerInfo.metadata?.platform)}
        </div>
        <div className="text-neutral-500 space-y-1">
          <div className="text-neutral-400 text-xs truncate">
            {peerInfo.metadata?.instance}
          </div>
          <div className="truncate text-xs">{peerInfo.metadata?.mdnsAddr}</div>
          <div className="flex items-center justify-between">
            <div className="truncate text-xs text-neutral-400">
              v{peerInfo.metadata?.version}
            </div>
            {hasActiveChat && (
              <span className="text-xs text-green-600 font-medium">● Active</span>
            )}
          </div>
        </div>
      </div>
      
      <Actions 
        peerInfo={peerInfo} 
        open={open} 
        onClose={() => setOpen(false)}
      />
    </>
  );
};
