"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Bot, Sparkles, Trash2 } from "lucide-react";

// --- Types ---
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AiChatPanelProps {
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  isOpen: boolean;
  onClose: () => void;
}

// --- Component ---
const AiChatPanel: React.FC<AiChatPanelProps> = ({
  taskId,
  taskTitle,
  taskDescription,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Build chat history for context (last 6 messages)
    const chatHistory = [...messages, userMessage]
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch("/api/ai-assistant/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          question,
          taskTitle,
          taskDescription,
          chatHistory,
        }),
      });

      const data = await response.json();

      if (response.ok && data.answer) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.error ||
              "Sorry, I could not process your question. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Connection error. The AI assistant service may not be running.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, taskId, taskTitle, taskDescription]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 z-100 w-[400px] h-[520px] flex flex-col bg-[#1e1e1e] border border-[#4a4a4a] rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#262626] border-b border-[#4a4a4a]">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <span className="text-sm font-semibold text-white">
            AI Assistant
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
            PDF
          </span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-1.5 rounded hover:bg-[#333] text-gray-400 hover:text-red-400 transition-colors"
              title="Clear chat"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Bot size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">
                Ask about the PDF
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                I can answer questions based on the reference material uploaded
                by your instructor. I will not solve assignment tasks for you.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 w-full mt-2">
              <SuggestionChip
                text="Summarize the key concepts"
                onClick={(t) => setInput(t)}
              />
              <SuggestionChip
                text="Explain the main topic"
                onClick={(t) => setInput(t)}
              />
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={14} className="text-purple-400" />
            </div>
            <div className="bg-[#2a2a2a] rounded-lg rounded-tl-none px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <div className="px-3 py-1 bg-[#1a1a1a] border-t border-[#333]">
        <p className="text-[9px] text-gray-600 text-center">
          Answers are based solely on instructor-uploaded materials. May contain
          inaccuracies.
        </p>
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-1 bg-[#1e1e1e]">
        <div className="flex items-end gap-2 bg-[#2a2a2a] border border-[#444] rounded-lg px-3 py-2 focus-within:border-purple-500/50 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the PDF content..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none resize-none max-h-20 overflow-y-auto"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-1.5 rounded-md transition-colors shrink-0 ${
              input.trim() && !isLoading
                ? "bg-purple-600 hover:bg-purple-500 text-white"
                : "bg-[#333] text-gray-600 cursor-not-allowed"
            }`}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={14} className="text-purple-400" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-purple-600/80 text-white rounded-tr-none"
            : "bg-[#2a2a2a] text-gray-200 rounded-tl-none border border-[#333]"
        }`}
      >
        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
      </div>
    </div>
  );
};

const SuggestionChip: React.FC<{
  text: string;
  onClick: (text: string) => void;
}> = ({ text, onClick }) => (
  <button
    onClick={() => onClick(text)}
    className="text-xs text-left px-3 py-2 rounded-lg border border-[#333] bg-[#2a2a2a] text-gray-400 hover:text-purple-300 hover:border-purple-500/30 hover:bg-purple-500/5 transition-colors"
  >
    {text}
  </button>
);

export default AiChatPanel;
