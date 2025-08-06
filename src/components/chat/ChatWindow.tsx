import React, { useState, useRef, useEffect } from 'react';
import { RiSendPlaneLine, RiCloseLine, RiUser3Line } from '@remixicon/react';
import { useChat } from '@/context/ChatContext';
import { ChatMessage } from '@/types/chat';

interface ChatWindowProps {
  peerId: string;
  onClose: () => void;
}

export function ChatWindow({ peerId, onClose }: ChatWindowProps) {
  const { sessions, sendMessage, markAsRead } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const session = sessions[peerId];

  useEffect(() => {
    // Mark messages as read when chat window is opened
    markAsRead(peerId);
  }, [peerId, markAsRead]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      await sendMessage(peerId, inputValue.trim());
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // You might want to show an error toast here
    }
  };

  if (!session) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat not found</h3>
          <p className="text-gray-600 mb-4">The chat session could not be found.</p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <RiUser3Line className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{session.peerName}</h3>
              <p className="text-sm text-gray-500">
                {session.isActive ? (
                  <span className="text-green-600">● Online</span>
                ) : (
                  <span className="text-gray-400">○ Offline</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RiCloseLine className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {session.messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            session.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!session.isActive}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || !session.isActive}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RiSendPlaneLine className="w-4 h-4" />
            </button>
          </div>
          {!session.isActive && (
            <p className="text-sm text-gray-500 mt-2">Peer is offline. Messages will be sent when they reconnect.</p>
          )}
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-3 py-2 rounded-lg ${
          message.isOutgoing
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            message.isOutgoing ? 'text-blue-200' : 'text-gray-500'
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
