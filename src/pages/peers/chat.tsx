import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  RiSendPlaneLine,
  RiArrowLeftLine,
  RiUser3Line,
} from "@remixicon/react";
import { useChat } from "@/context/ChatContext";
import { ChatMessage } from "@/types/chat";
import { StatusBar } from "@/components/status-bar";
import { usePeers } from "./hooks/use-peers";

export default function PeerChatPage() {
  const { peerId } = useParams<{ peerId: string }>();
  const navigate = useNavigate();
  const { messages, sendMessage, connectToPeer } = useChat();
  const { peers } = usePeers();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!peerId) {
    navigate("/peers");
    return null;
  }

  const peerMessages = messages[peerId] || [];
  const peerInfo = peers[peerId];
  const peerAddress = peerInfo?.metadata?.wsAddr;

  useEffect(() => {
    // Connect to peer when chat page loads
    if (peerId && peerAddress) {
      connectToPeer(peerId, peerAddress);
    }
  }, [peerId, peerAddress, connectToPeer]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [peerMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !peerId || !peerAddress) return;

    try {
      await sendMessage(peerId, peerAddress, inputValue.trim());
      setInputValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
      // You might want to show an error toast here
    }
  };

  const handleBack = () => {
    navigate("/peers");
  };

  if (!peerInfo) {
    return (
      <main className="h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Peer not found
            </h3>
            <p className="text-gray-600 mb-4">
              The peer could not be found.
            </p>
            <button
              onClick={handleBack}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Peers
            </button>
          </div>
        </div>
        <StatusBar peersCount={Object.keys(peers).length} />
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-2 border-b border-gray-200 bg-white">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <RiArrowLeftLine className="w-5 h-5 text-gray-600" />
        </button>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <RiUser3Line className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{peerInfo.metadata?.name || "Unknown Peer"}</h3>
          <p className="text-sm text-gray-500">
            <span className="text-green-600">● Online</span>
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {peerMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          peerMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage}>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RiSendPlaneLine className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex ${message.isOutgoing ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[70%] px-3 py-2 rounded-lg ${
          message.isOutgoing
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            message.isOutgoing ? "text-blue-200" : "text-gray-500"
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
