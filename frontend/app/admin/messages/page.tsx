"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import ChatWindow from "./ChatWindow";
import { Conversation, Message } from "./types";

const DUMMY_CONVERSATIONS: Conversation[] = [
  { id: "1", name: "Matriks Studio", avatarUrl: "", unread: 2, lastMessage: "Dimas Eza Typing...", pinned: true },
  { id: "2", name: "Matriks Lab", avatarUrl: "", unread: 2, lastMessage: "Boleh di cek...", pinned: true },
  { id: "3", name: "Work, Work, Work", avatarUrl: "", unread: 0, lastMessage: "Siap pak, noted!" },
  { id: "4", name: "Hisyam", avatarUrl: "", unread: 0, lastMessage: "Design sudah selesai ya" },
  { id: "5", name: "Dimas Eza", avatarUrl: "", unread: 0, lastMessage: "Redesign udah siap nih" },
];

const DUMMY_MESSAGES: { [key: string]: Message[] } = {
  "1": [
    { id: "m1", sender: "Nick Jo", text: "Happy Weekend gaiss...", time: "4:30 PM", mine: false },
    { id: "m2", sender: "You", text: "Wahhh boleh tuh dashboard design 👍", time: "4:31 PM", mine: true },
  ],
  "2": [
    { id: "m3", sender: "Matriks Lab", text: "Boleh di cek untuk email hari ini?", time: "4:30 PM", mine: false },
  ],
  "3": [
    { id: "m4", sender: "Work, Work, Work", text: "Siap pak, noted!", time: "4:30 PM", mine: false },
  ],
};

export default function AdminMessagesPage() {
  const [selectedId, setSelectedId] = useState<string>(DUMMY_CONVERSATIONS[0].id);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>(DUMMY_MESSAGES);

  const handleSend = (text: string) => {
    setMessages(prev => ({
      ...prev,
      [selectedId]: [
        ...(prev[selectedId] || []),
        {
          id: `m${Math.random()}`,
          sender: "You",
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mine: true,
        }
      ]
    }));
  };

  const selectedConversation = DUMMY_CONVERSATIONS.find(c => c.id === selectedId);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex flex-1">
        <MessageList
          conversations={DUMMY_CONVERSATIONS}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <ChatWindow
          conversation={selectedConversation}
          messages={messages[selectedId] || []}
          onSend={handleSend}
        />
      </main>
    </div>
  );
} 