import { Conversation } from "./types";
import { FaThumbtack } from "react-icons/fa";

interface MessageListProps {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function MessageList({ conversations, selectedId, onSelect }: MessageListProps) {
  return (
    <section className="w-80 border-r bg-white flex flex-col">
      <div className="p-4 border-b">
        <input
          className="w-full p-2 border rounded bg-gray-50"
          placeholder="Search Messages"
        />
      </div>
      <div className="px-4 py-2 text-xs text-gray-400 font-semibold">PINNED MESSAGES</div>
      <div>
        {conversations
          .filter((c) => c.pinned)
          .map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer rounded-lg mx-2 my-1 transition-all ${
                selectedId === conv.id ? "bg-purple-100" : "hover:bg-gray-50"
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <img src={conv.avatarUrl || "/default-avatar.png"} alt={conv.name} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="font-semibold">{conv.name}</div>
                <div className="text-xs text-gray-500">{conv.lastMessage}</div>
              </div>
              <FaThumbtack className="text-purple-400" />
              {conv.unread > 0 && (
                <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5 ml-auto">
                  {conv.unread}
                </span>
              )}
            </div>
          ))}
      </div>
      <div className="px-4 py-2 text-xs text-gray-400 font-semibold">ALL MESSAGES</div>
      <div className="flex-1 overflow-y-auto">
        {conversations
          .filter((c) => !c.pinned)
          .map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer rounded-lg mx-2 my-1 transition-all ${
                selectedId === conv.id ? "bg-purple-100" : "hover:bg-gray-50"
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <img src={conv.avatarUrl || "/default-avatar.png"} alt={conv.name} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="font-semibold">{conv.name}</div>
                <div className="text-xs text-gray-500">{conv.lastMessage}</div>
              </div>
              {conv.unread > 0 && (
                <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5 ml-auto">
                  {conv.unread}
                </span>
              )}
            </div>
          ))}
      </div>
    </section>
  );
} 