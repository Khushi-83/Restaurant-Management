import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { Message, Conversation } from "./types";
import { useEffect, useRef } from "react";
import { FaUserCircle, FaThumbtack } from "react-icons/fa";

interface ChatWindowProps {
  conversation: Conversation | undefined;
  messages: Message[];
  onSend: (text: string) => void;
}

export default function ChatWindow({ conversation, messages, onSend }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

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

  return (
    <section className="flex-1 flex flex-col bg-gradient-to-br from-purple-50 to-white">
      <header className="p-4 border-b flex items-center gap-2">
        <FaUserCircle color="#a78bfa" size={32} />
        <span className="font-bold text-lg">{conversation.name}</span>
      </header>
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
      <MessageInput onSend={onSend} />
    </section>
  );
} 