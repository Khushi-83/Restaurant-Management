import { useState } from "react";
import { FaMicrophone } from "react-icons/fa";

interface MessageInputProps {
  onSend: (text: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSend(value);
      setValue("");
    }
  };

  return (
    <form className="p-4 border-t flex gap-2 bg-white/80" onSubmit={handleSubmit}>
      <input
        className="flex-1 p-2 border rounded bg-gray-50"
        placeholder="Type your message"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button type="button" className="p-2 text-purple-500" title="Record audio message"><FaMicrophone /></button>
      <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded">Send</button>
    </form>
  );
} 