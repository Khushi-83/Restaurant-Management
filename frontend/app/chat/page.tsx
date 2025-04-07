"use client"

import { useState } from "react"

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { from: "admin", text: "Hi there! How can I help you?" },
  ])
  const [input, setInput] = useState("")

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages([...messages, { from: "user", text: input }])
    setInput("")
  }

  return (
    <div className="flex flex-col h-[80vh] p-4">
      <h2 className="text-xl font-semibold mb-4">Live Chat</h2>
      <div className="flex-1 overflow-y-auto space-y-3 bg-gray-50 p-4 rounded-md shadow-inner">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-[70%] ${msg.from === "user" ? "bg-blue-100 ml-auto text-right" : "bg-gray-200"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 border rounded-md p-2"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md" onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}
