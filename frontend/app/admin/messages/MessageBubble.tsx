import { Message } from "./types";

export default function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`rounded-xl px-4 py-2 max-w-xs break-words shadow-sm ${message.mine ? 'bg-purple-200 text-purple-900' : 'bg-white border'}`}>
        <div>{message.text}</div>
        <div className="text-xs text-gray-400 text-right">{message.time}</div>
      </div>
    </div>
  );
} 