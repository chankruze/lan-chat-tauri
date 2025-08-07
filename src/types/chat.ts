export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  isOutgoing: boolean;
}

export interface ChatSession {
  peerId: string;
  peerName: string;
  peerAddress: string;
  messages: ChatMessage[];
  unreadCount: number;
  lastActivity: number;
  isActive: boolean;
}

export interface ChatContextType {
  messages: Record<string, ChatMessage[]>; // peerId -> messages
  sendMessage: (peerId: string, peerAddress: string, content: string) => Promise<void>;
  connectToPeer: (peerId: string, peerAddress: string) => Promise<void>;
}
