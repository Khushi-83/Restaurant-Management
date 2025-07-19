import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { Message, Conversation } from "./types";
import { useEffect, useRef, useState } from "react";
import { FaUserCircle, FaThumbtack } from "react-icons/fa";

interface ChatWindowProps {
  conversation: Conversation | undefined;
  messages: Message[];
  onSend: (text: string) => void;
}

const QUICK_REPLIES = [
  "Ask song suggestion",
  "Request menu",
  "Say thank you",
  "Ask for order status",
  "Request bill"
];

export default function ChatWindow({ conversation, messages, onSend }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [inputKey, setInputKey] = useState(0); // To reset MessageInput after quick reply

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <span className="text-gray-400">Select a conversation to start chatting</span>
      </section>
    );
  }

  const handleQuickReply = (msg: string) => {
    onSend(msg);
    setInputKey(prev => prev + 1); // Reset input
  };

  return (
    <section className="flex-1 flex flex-col bg-gradient-to-br from-purple-50 to-white">
      <header className="p-4 border-b flex items-center gap-2">
        <FaUserCircle color="#a78bfa" size={32} />
        <span className="font-bold text-lg">{conversation.name}</span>
      </header>
      {/* Notice to mention table number */}
      <div className="bg-yellow-100 text-yellow-800 text-center text-sm py-2 px-4 font-medium border-b border-yellow-200">
        <span>Notice: Please mention your <b>table number</b> before sending any message.</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {conversation.pinned && (
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <FaThumbtack color="#a78bfa" size={18} /> Pinned Message
            </span>
            <span className="text-gray-500 text-xs">{conversation.lastMessage}</span>
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
      {/* Quick Replies */}
      <div className="flex gap-2 px-4 pb-2">
        {QUICK_REPLIES.map((reply, idx) => (
          <button
            key={idx}
            className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-purple-200 transition"
            onClick={() => handleQuickReply(reply)}
            type="button"
          >
            {reply}
          </button>
        ))}
      </div>
      <MessageInput key={inputKey} onSend={onSend} />
    </section>
  );
} 