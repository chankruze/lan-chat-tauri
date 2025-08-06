import React, { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { NotificationToast } from './NotificationToast';
import { ChatWindow } from '@/components/chat/ChatWindow';

export function NotificationContainer() {
  const { notifications, dismissNotification } = useChat();
  const [chatPeerId, setChatPeerId] = useState<string | null>(null);

  const handleNotificationClick = (peerId: string) => {
    setChatPeerId(peerId);
  };

  const handleCloseChatWindow = () => {
    setChatPeerId(null);
  };

  return (
    <>
      {/* Notification Stack */}
      <div className="fixed top-4 right-4 z-40 space-y-2">
        {notifications.slice(0, 5).map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
            onActionClick={() => handleNotificationClick(notification.peerId)}
          />
        ))}
      </div>

      {/* Chat Window */}
      {chatPeerId && (
        <ChatWindow
          peerId={chatPeerId}
          onClose={handleCloseChatWindow}
        />
      )}
    </>
  );
}
