"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import ChatWindow from "./ChatWindow";
import { Conversation, Message } from "./types";
import { FaBars } from "react-icons/fa";

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(false);

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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="flex md:hidden items-center justify-between p-2 border-b bg-white z-20">
        <button onClick={() => setMobileSidebarOpen(true)} className="p-2" title="Open sidebar"><FaBars /></button>
        <span className="font-bold text-lg">Messages</span>
        <button onClick={() => setMobileListOpen(true)} className="p-2" title="Open message list"><FaBars /></button>
      </div>
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar (mobile drawer) */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative w-64 bg-white min-h-screen shadow-lg z-50">
              <Sidebar />
              <button className="absolute top-2 right-2 p-2" onClick={() => setMobileSidebarOpen(false)}>Close</button>
            </div>
          </div>
        )}
        {/* Sidebar (desktop) */}
        <div className="hidden md:block h-full"><Sidebar /></div>
        {/* Message List (mobile drawer) */}
        {mobileListOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setMobileListOpen(false)} />
            <div className="relative w-80 bg-white min-h-screen shadow-lg z-50">
              <MessageList conversations={DUMMY_CONVERSATIONS} selectedId={selectedId} onSelect={id => { setSelectedId(id); setMobileListOpen(false); }} />
              <button className="absolute top-2 right-2 p-2" onClick={() => setMobileListOpen(false)}>Close</button>
            </div>
          </div>
        )}
        {/* Message List (desktop) */}
        <div className="hidden md:flex h-full"><MessageList conversations={DUMMY_CONVERSATIONS} selectedId={selectedId} onSelect={setSelectedId} /></div>
        {/* Chat Window */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatWindow conversation={selectedConversation} messages={messages[selectedId] || []} onSend={handleSend} />
        </div>
      </div>
    </div>
  );
} 