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
// import { Badge } from "@/components/ui/badge"
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

const QUICK_REPLIES = [
  "Ask song suggestion",
  "Request menu",
  "Say thank you",
  "Ask for order status",
  "Request bill"
];

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
    socket.emit("new_message", {
      sender: "User",
      message: input,
    });
    setInput("");
    // Do NOT update setMessages here to avoid duplication
  };

  const handleQuickReply = (msg: string) => {
    setInput(msg);
  };

  return (
    <>
      <div className="w-full max-w-4xl sm:mx-auto px-0 sm:px-4 py-0 sm:py-8 -mt-2 sm:mt-0">

        <Card className="border-0 sm:border-2 border-gray-200 bg-white/90 backdrop-blur-sm shadow-xl rounded-none sm:rounded-2xl flex flex-col h-[calc(100vh-60px)] sm:h-[70vh]">
          {/* Chat Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center gap-3">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-red-100">
              <AvatarFallback className="bg-red-50 text-red-600 font-semibold">
                RS
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-serif text-xl text-gray-900">Restaurant Support</h2>
              <p className="text-sm text-gray-500">&lsquo;Usually replies within 5 minutes&rsquo;</p>
            </div>
          </div>
          {/* Notice to mention table number */}
          <div className="bg-yellow-100 text-yellow-800 text-center text-sm py-2 px-4 font-medium border-b border-yellow-200">
            <span>Notice: Please mention your <b>table number</b> before sending any message.</span>
          </div>
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-3 sm:p-6 bg-gradient-to-b from-gray-50 to-white" ref={scrollRef}>
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
                    <Avatar className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-200">
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
                        className={`rounded-2xl px-4 py-2.5 max-w-[85%] sm:max-w-[480px] break-words ${
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
          {/* Quick Replies */}
          <div className="flex gap-2 px-3 sm:px-4 pt-2 pb-2 flex-wrap sm:flex-nowrap overflow-x-auto border-t border-gray-100 bg-white">
            {QUICK_REPLIES.map((reply, idx) => (
              <button
                key={idx}
                className="bg-red-100 text-red-700 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium hover:bg-red-200 transition whitespace-nowrap"
                onClick={() => handleQuickReply(reply)}
                type="button"
              >
                {reply}
              </button>
            ))}
          </div>
          {/* Input Area */}
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-100 bg-white sticky bottom-0 z-10 rounded-none sm:rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              className="flex gap-2 sm:gap-3"
            >
              <Input
                ref={inputRef}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border-gray-200 focus:border-red-500 focus:ring-red-500 bg-gray-50/50 text-sm sm:text-base"
              />
              <Button 
                type="submit" 
                size="icon"
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 w-11 sm:h-12 sm:w-12 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </>
  )
}
