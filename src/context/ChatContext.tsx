import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { 
  ChatContextType, 
  ChatSession, 
  ChatMessage, 
  ChatNotification 
} from '@/types/chat';
import { 
  ensureServerAndConnect, 
  sendMessageToPeer, 
  isWebSocketServerRunning 
} from '@/services/ws';

interface WsMessageEvent {
  type: 'MessageReceived';
  id: string;
  timestamp: string;
  addr: string;
  message: string;
}

interface WsConnectionEvent {
  type: 'Connected' | 'Disconnected';
  id: string;
  timestamp: string;
  addr: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({});
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);

  // Generate unique IDs
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addNotification = useCallback((notification: Omit<ChatNotification, 'id'>) => {
    const newNotification: ChatNotification = {
      ...notification,
      id: generateId(),
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only latest 50 notifications
  }, []);

  const startChat = useCallback(async (peerId: string, peerName: string, peerAddress: string) => {
    try {
      // Ensure WebSocket server is running and connect
      await ensureServerAndConnect(peerAddress);
      
      // Create or update session
      setSessions(prev => ({
        ...prev,
        [peerId]: prev[peerId] ? {
          ...prev[peerId],
          isActive: true,
          lastActivity: Date.now(),
        } : {
          peerId,
          peerName,
          peerAddress,
          messages: [],
          unreadCount: 0,
          lastActivity: Date.now(),
          isActive: true,
        }
      }));

      // Add connection notification
      addNotification({
        peerId,
        peerName,
        message: `Connected to ${peerName}`,
        timestamp: Date.now(),
        type: 'connection',
      });

      // Set as active session
      setActiveSession(peerId);
    } catch (error) {
      console.error('Failed to start chat:', error);
      addNotification({
        peerId,
        peerName,
        message: `Failed to connect to ${peerName}`,
        timestamp: Date.now(),
        type: 'system',
      });
    }
  }, [addNotification]);

  const sendMessage = useCallback(async (peerId: string, content: string) => {
    const session = sessions[peerId];
    if (!session) {
      throw new Error('No active session found');
    }

    const message: ChatMessage = {
      id: generateId(),
      senderId: 'self', // You might want to get actual user ID
      senderName: 'You',
      content,
      timestamp: Date.now(),
      isOutgoing: true,
    };

    // Add message to session
    setSessions(prev => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        messages: [...prev[peerId].messages, message],
        lastActivity: Date.now(),
      }
    }));

    // Send via WebSocket
    try {
      await sendMessageToPeer(session.peerAddress, content);
    } catch (error) {
      console.error('Failed to send message:', error);
      // You might want to mark message as failed and show error
    }
  }, [sessions]);

  const markAsRead = useCallback((peerId: string) => {
    setSessions(prev => ({
      ...prev,
      [peerId]: prev[peerId] ? {
        ...prev[peerId],
        unreadCount: 0,
      } : prev[peerId]
    }));
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const getTotalUnreadCount = useCallback(() => {
    return Object.values(sessions).reduce((total, session) => total + session.unreadCount, 0);
  }, [sessions]);

  const getUnreadCount = useCallback((peerId: string) => {
    return sessions[peerId]?.unreadCount || 0;
  }, [sessions]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    const setupWebSocketListeners = async () => {
      try {
        // Listen for WebSocket messages
        const unlistenMessage = await listen<WsMessageEvent>('ws-message', (event) => {
          console.log('Received WebSocket message:', event.payload);
          const { addr, message } = event.payload;
          
          // Find session by address
          const session = Object.values(sessions).find(s => s.peerAddress === addr);
          if (!session) {
            console.warn('Received message from unknown peer:', addr);
            return;
          }

          const incomingMessage: ChatMessage = {
            id: generateId(),
            senderId: session.peerId,
            senderName: session.peerName,
            content: message,
            timestamp: Date.now(),
            isOutgoing: false,
          };

          setSessions(prev => ({
            ...prev,
            [session.peerId]: {
              ...prev[session.peerId],
              messages: [...prev[session.peerId].messages, incomingMessage],
              unreadCount: activeSession === session.peerId ? 0 : prev[session.peerId].unreadCount + 1,
              lastActivity: Date.now(),
            }
          }));

          // Add notification if not in active session
          if (activeSession !== session.peerId) {
            addNotification({
              peerId: session.peerId,
              peerName: session.peerName,
              message: message.length > 50 ? message.substring(0, 50) + '...' : message,
              timestamp: Date.now(),
              type: 'message',
            });
          }
        });

        // Listen for WebSocket connections
        const unlistenConnected = await listen<WsConnectionEvent>('ws-connected', (event) => {
          console.log('WebSocket connected:', event.payload);
          const { addr } = event.payload;
          
          // Find session by address and mark as active
          const session = Object.values(sessions).find(s => s.peerAddress === addr);
          if (session) {
            setSessions(prev => ({
              ...prev,
              [session.peerId]: {
                ...prev[session.peerId],
                isActive: true,
              }
            }));
          }
        });

        // Listen for WebSocket disconnections
        const unlistenDisconnected = await listen<WsConnectionEvent>('ws-disconnected', (event) => {
          console.log('WebSocket disconnected:', event.payload);
          const { addr } = event.payload;
          
          // Find session by address and mark as inactive
          const session = Object.values(sessions).find(s => s.peerAddress === addr);
          if (session) {
            setSessions(prev => ({
              ...prev,
              [session.peerId]: {
                ...prev[session.peerId],
                isActive: false,
              }
            }));

            addNotification({
              peerId: session.peerId,
              peerName: session.peerName,
              message: `Disconnected from ${session.peerName}`,
              timestamp: Date.now(),
              type: 'system',
            });
          }
        });

        return () => {
          unlistenMessage();
          unlistenConnected();
          unlistenDisconnected();
        };
      } catch (error) {
        console.error('Failed to setup WebSocket listeners:', error);
      }
    };

    setupWebSocketListeners();
  }, [sessions, activeSession, addNotification]);

  // Auto-mark messages as read when session becomes active
  useEffect(() => {
    if (activeSession) {
      markAsRead(activeSession);
    }
  }, [activeSession, markAsRead]);

  const value: ChatContextType = {
    sessions,
    activeSession,
    notifications,
    startChat,
    sendMessage,
    markAsRead,
    setActiveSession,
    dismissNotification,
    getTotalUnreadCount,
    getUnreadCount,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
