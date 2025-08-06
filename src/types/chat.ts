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

export interface ChatNotification {
  id: string;
  peerId: string;
  peerName: string;
  message: string;
  timestamp: number;
  type: 'message' | 'connection' | 'system';
}

export interface ChatContextType {
  sessions: Record<string, ChatSession>;
  activeSession: string | null;
  notifications: ChatNotification[];
  startChat: (peerId: string, peerName: string, peerAddress: string) => Promise<void>;
  sendMessage: (peerId: string, content: string) => Promise<void>;
  markAsRead: (peerId: string) => void;
  setActiveSession: (peerId: string | null) => void;
  dismissNotification: (notificationId: string) => void;
  getTotalUnreadCount: () => number;
  getUnreadCount: (peerId: string) => number;
}
