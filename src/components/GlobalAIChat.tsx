import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Volume2, Headphones, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { askNatureAI } from "../services/geminiService";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface GlobalAIChatProps {
  meshData?: any[];
}

const GlobalAIChat: React.FC<GlobalAIChatProps> = ({ meshData = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hello! I am Genie 🌿, your Internet of Nature assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;

    if (!overrideText) setInput("");
    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setIsTyping(true);

    try {
      const context = `Current system state: ${JSON.stringify(meshData)}. User is monitoring ecological data. If they ask for developer features, point them to the "AI Lab" or "Developer" section.`;

      const aiText = await askNatureAI(textToSend, context);
      setMessages((prev) => [...prev, { role: "ai", text: aiText }]);

      // Voice Synthesis
      if (isVoiceActive && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(aiText);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Connection to Genie Core lost. Please check your network and API configuration.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Expose openGenie to the global window object for external triggers
  useEffect(() => {
    (window as any).openGenie = (initialMsg?: string) => {
      setIsOpen(true);
      if (initialMsg) {
        setTimeout(() => handleSend(initialMsg), 500);
      }
    };
  }, [meshData]);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[400px] h-[600px] glass rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-nature-100"
          >
            {/* Header */}
            <div className="p-6 bg-nature-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-bold">Genie Assistant</h4>
                  <p className="text-[10px] text-emerald-400 uppercase tracking-widest">
                    Core AI Active
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsVoiceActive(!isVoiceActive)}
                  className={`p-2 rounded-xl transition-all ${
                    isVoiceActive
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                  title={isVoiceActive ? "Voice enabled" : "Voice disabled"}
                >
                  {isVoiceActive ? (
                    <Volume2 size={18} />
                  ) : (
                    <Headphones size={18} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-nature-50/50"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-3xl text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-nature-900 text-white rounded-tr-none"
                        : "bg-white text-nature-900 rounded-tl-none border border-nature-100 shadow-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-nature-100 shadow-sm flex gap-1">
                    <div className="w-1.5 h-1.5 bg-nature-300 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-nature-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-nature-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-nature-100 flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder="Ask Genie anything..."
                className="flex-1 px-6 py-3 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all text-sm"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
                className="p-3 bg-nature-900 text-white rounded-2xl hover:bg-nature-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-nature-900 text-white rounded-[24px] shadow-2xl flex items-center justify-center hover:scale-110 transition-all group relative"
      >
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        <Sparkles
          size={28}
          className="group-hover:rotate-12 transition-transform"
        />
      </button>
    </div>
  );
};

export default GlobalAIChat;
