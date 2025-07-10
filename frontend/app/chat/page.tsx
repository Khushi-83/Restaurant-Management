"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { socket } from "@/lib/socket";

type Message = {
  id: string;
  from: "admin" | "user";
  text: string;
  timestamp: Date;
  status?: "sending" | "sent" | "seen";
}

// Replace 'any' with a type for chat messages
interface ChatMessageFromBackend {
  id?: string;
  sender: string;
  message: string;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    socket.connect();

    // Fetch existing messages
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/messages`)
      .then(res => res.json())
      .then((data: ChatMessageFromBackend[]) => {
        setMessages(data.map((msg) => ({
          id: msg.id || Date.now().toString(),
          from: msg.sender === 'Admin' ? 'admin' : 'user',
          text: msg.message,
          timestamp: new Date(msg.timestamp),
          status: 'sent',
        })));
      });

    // Listen for new messages
    socket.on("new_message", (msg: ChatMessageFromBackend) => {
      setMessages(prev => [...prev, {
        id: msg.id || Date.now().toString(),
        from: msg.sender === 'Admin' ? 'admin' : 'user',
        text: msg.message,
        timestamp: new Date(msg.timestamp),
        status: 'sent',
      }]);
    });

    return () => {
      socket.disconnect();
      socket.off("new_message");
    };
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      from: "user",
      text: input,
      timestamp: new Date(),
      status: "sending"
    };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    // Send to backend via socket
    socket.emit("new_message", {
      sender: "User",
      message: newMessage.text,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
      <Badge className="bg-red-200 text-red-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
          Live Support
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-900 mb-2">
          Chat with Us
        </h1>
        <p className="text-gray-600">
          Our team is here to help you with your dining experience
        </p>
      </div>

      <Card className="border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 bg-white rounded-t-2xl flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-red-100">
            <AvatarFallback className="bg-red-50 text-red-600 font-semibold">
              RS
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-serif text-xl text-gray-900">Restaurant Support</h2>
            <p className="text-sm text-gray-500">
              {/* isTyping ? (
                <span className="flex items-center gap-2 text-red-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Typing...
                </span>
              ) : (
                "Usually replies within 5 minutes"
              ) */}
              `&lsquo;Usually replies within 5 minutes&rsquo;`
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="h-[60vh] p-6 bg-gradient-to-b from-gray-50 to-white" ref={scrollRef}>
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} mb-6`}
              >
                <div className={`flex gap-3 items-end ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                  <Avatar className="w-8 h-8 border border-gray-200">
                    <AvatarFallback 
                      className={msg.from === "admin" 
                        ? "bg-red-50 text-red-600 font-semibold" 
                        : "bg-blue-50 text-blue-600 font-semibold"}
                    >
                      {msg.from === "admin" ? "RS" : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-2xl px-4 py-2.5 max-w-[320px] break-words ${
                        msg.from === "user"
                          ? "bg-red-600 text-white"
                          : "bg-white border border-gray-200 shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 px-1">
                      <span className="text-xs text-gray-500">
                        {format(msg.timestamp, "HH:mm")}
                      </span>
                      {msg.from === "user" && (
                        <span className="text-xs text-gray-500">
                          {msg.status === "sending" && "Sending..."}
                          {msg.status === "sent" && "Delivered"}
                          {msg.status === "seen" && "Seen"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {/* isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-6"
              >
                <div className="flex gap-3 items-end">
                  <Avatar className="w-8 h-8 border border-gray-200">
                    <AvatarFallback className="bg-red-50 text-red-600 font-semibold">
                      RS
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) */}
          </AnimatePresence>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex gap-3"
          >
            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border-gray-200 focus:border-red-500 focus:ring-red-500 bg-gray-50/50"
            />
            <Button 
              type="submit" 
              size="icon"
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 w-12 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
