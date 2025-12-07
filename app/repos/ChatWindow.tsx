"use client";

import { useEffect, useState } from "react";

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-500 shadow-sm rounded-tl-none max-w-sm">
      <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
      <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
      <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
      <span className="text-sm ml-2">Reviewing code...</span>
    </div>
  </div>
);

function ChatInput({ onSend, disabled }:{ onSend: (msg: string) => void; disabled: boolean }) {
  const [value, setValue] = useState("");

  function handleSend() {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  }

  return (
    <div className="flex items-center">
      <input
        className="border text-black border-gray-300 p-3 flex-1 rounded-l-lg"
        placeholder="Ask something about this repo…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={disabled}
      />
      <button
        className={`ml-0 px-6 py-3 rounded-r-lg font-semibold ${
          disabled || !value.trim()
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
        onClick={handleSend}
        disabled={disabled || !value.trim()}
      >
        Send
      </button>
    </div>
  );
}

export function ChatWindow({ repoId, repoName }:{ repoId: string; repoName: string}) {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  useEffect(() => {
    const storageKey = `chat_messages_${repoId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse stored messages:", error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [repoId]);

  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = `chat_messages_${repoId}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, repoId]);

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages, isAssistantTyping]);

  async function sendMessage(prompt: string) {
    if (!prompt.trim()) return;

    const userMsg = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setIsAssistantTyping(true);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_id: repoId, prompt }),
      });

      const data = await res.json();

      const assistantMsg = {
        role: "assistant",
        text: data.answer || "Sorry, I couldn't get a response.",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg = {
        role: "assistant",
        text: "An error occurred while communicating with the server.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAssistantTyping(false);
    }
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">

      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-md">
        <h2 className="text-xl font-bold text-gray-800 truncate">
          Chat with: <span className="text-indigo-600">{repoName}</span> repo
        </h2>
      </div>

      {/* Chat */}
      <div id="chat-container" className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-4 rounded-xl shadow-md whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-white text-gray-800 rounded-tl-sm border border-gray-200 w-full"
              }`}
            >
              <div className="text-sm">{msg.text}</div>
            </div>
          </div>
        ))}
        {isAssistantTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white shadow-inner">
        <ChatInput onSend={sendMessage} disabled={isAssistantTyping} />
      </div>
    </div>
  );
}