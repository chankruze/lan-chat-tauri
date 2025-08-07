import React, { createContext, useContext, useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { connectToPeer, sendMessageToPeer } from "@/services/ws";
import routes from "@/routes";
import { ChatMessage } from "@/types/chat";

interface WsMessageEvent {
  type: "MessageReceived";
  id: string;
  timestamp: string;
  addr: string;
  message: string;
}

interface SimpleChatContextType {
  messages: Record<string, ChatMessage[]>; // peerId -> messages
  sendMessage: (peerId: string, peerAddress: string, content: string) => Promise<void>;
  connectToPeer: (peerId: string, peerAddress: string) => Promise<void>;
}

const ChatContext = createContext<SimpleChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [currentChatPeerId, setCurrentChatPeerId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Generate unique IDs
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Connect to peer
  const connectToPeerHandler = async (peerId: string, peerAddress: string) => {
    try {
      await connectToPeer(peerAddress);
      toast.success(`Connected to peer`, { position: "top-right" });
    } catch (error) {
      console.error("Failed to connect to peer:", error);
      toast.error(`Failed to connect to peer`, { position: "top-right" });
    }
  };

  // Send message
  const sendMessageHandler = async (peerId: string, peerAddress: string, content: string) => {
    const message: ChatMessage = {
      id: generateId(),
      senderId: "self",
      senderName: "You",
      content,
      timestamp: Date.now(),
      isOutgoing: true,
    };

    // Add message to local state
    setMessages(prev => ({
      ...prev,
      [peerId]: [...(prev[peerId] || []), message],
    }));

    // Send via WebSocket
    try {
      await sendMessageToPeer(peerAddress, content);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message", { position: "top-right" });
    }
  };

  // Handle incoming WebSocket messages
  useEffect(() => {
    const setupWebSocketListener = async () => {
      try {
        const unlisten = await listen<WsMessageEvent>("ws-message", (event) => {
          const { addr, message: content } = event.payload;
          
          // We need to find the peerId from the address
          // For now, let's use a simple approach - we'll get this from peers hook
          
          const message: ChatMessage = {
            id: generateId(),
            senderId: addr, // We'll use address as sender ID for now
            senderName: "Peer",
            content,
            timestamp: Date.now(),
            isOutgoing: false,
          };

          // Check if we're currently in a chat with this peer
          const currentPath = window.location.pathname;
          const chatRouteMatch = currentPath.match(/\/peers\/([^/]+)\/chat/);
          const currentChatPeerFromRoute = chatRouteMatch ? chatRouteMatch[1] : null;

          // For now, let's use address as peerId (we can improve this later)
          const peerId = addr.replace(/[.:]/g, '_'); // Convert address to valid peerId
          
          // Add message to state
          setMessages(prev => ({
            ...prev,
            [peerId]: [...(prev[peerId] || []), message],
          }));

          // Show toast notification if not in active chat
          if (currentChatPeerFromRoute !== peerId) {
            const displayMessage = content.length > 50 ? content.substring(0, 50) + "..." : content;
            toast.info(`New message: ${displayMessage}`, {
              position: "top-right",
              autoClose: 5000,
              onClick: () => {
                navigate(routes.peers.peer.chat.path(peerId));
              },
            });
          }
        });

        return unlisten;
      } catch (error) {
        console.error("Failed to setup WebSocket listener:", error);
      }
    };

    setupWebSocketListener();
  }, [navigate]);

  const value: SimpleChatContextType = {
    messages,
    sendMessage: sendMessageHandler,
    connectToPeer: connectToPeerHandler,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
