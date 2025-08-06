import React, { useEffect } from 'react';
import { RiCloseLine, RiMessage3Line, RiWifiLine, RiErrorWarningLine } from '@remixicon/react';
import { ChatNotification } from '@/types/chat';

interface NotificationToastProps {
  notification: ChatNotification;
  onDismiss: (id: string) => void;
  onActionClick?: () => void;
  autoHide?: boolean;
}

export function NotificationToast({ 
  notification, 
  onDismiss, 
  onActionClick,
  autoHide = true 
}: NotificationToastProps) {
  
  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, 5000); // Auto-hide after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [notification.id, onDismiss, autoHide]);

  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return <RiMessage3Line className="w-5 h-5 text-blue-600" />;
      case 'connection':
        return <RiWifiLine className="w-5 h-5 text-green-600" />;
      case 'system':
        return <RiErrorWarningLine className="w-5 h-5 text-orange-600" />;
      default:
        return <RiMessage3Line className="w-5 h-5 text-gray-600" />;
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case 'message':
        return 'border-blue-200 bg-blue-50';
      case 'connection':
        return 'border-green-200 bg-green-50';
      case 'system':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div
      className={`
        max-w-sm w-full shadow-lg rounded-lg border ${getColors()} 
        transform transition-all duration-300 ease-in-out
        hover:scale-105 cursor-pointer
      `}
      onClick={onActionClick}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.peerName}
            </p>
            <p className="text-sm text-gray-600 mt-1 truncate">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {formatTime(notification.timestamp)}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notification.id);
              }}
              className="rounded-md p-1 hover:bg-gray-200 transition-colors"
            >
              <RiCloseLine className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
