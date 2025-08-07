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
  sessions: Record<string, ChatSession>;
  activeSession: string | null;
  startChat: (peerId: string, peerName: string, peerAddress: string) => Promise<void>;
  sendMessage: (peerId: string, content: string) => Promise<void>;
  markAsRead: (peerId: string) => void;
  setActiveSession: (peerId: string | null) => void;
  getTotalUnreadCount: () => number;
  getUnreadCount: (peerId: string) => number;
}
