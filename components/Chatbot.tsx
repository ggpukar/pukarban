import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { motion } from 'framer-motion';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Namaste! I'm your AI guide for Prabin's portfolio. Ask me about the projects, the 3D map, or Nepal!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Gemini Client with safety check
    const initAI = async () => {
      try {
          // Safe access to process.env.API_KEY
          const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
          
          if (!apiKey) {
             console.warn("API Key is missing from process.env");
             return;
          }

          const ai = new GoogleGenAI({ apiKey });
          chatSession.current = ai.chats.create({
              model: 'gemini-3-pro-preview',
              config: {
                  systemInstruction: "You are an intelligent and friendly 3D Portfolio AI Assistant for Prabin Ban. You embody the spirit of Nepal—warm, welcoming, and knowledgeable. You can explain the technical details of this React/Three.js website, provide information about the projects shown (Gallery, Games, Tools), and share interesting facts about Nepali culture like Mount Everest, Lumbini, and festivals like Tihar. Keep your responses concise, engaging, and helpful. Use emojis occasionally.",
              }
          });
      } catch (error) {
          console.error("Failed to initialize AI", error);
      }
    };
    initAI();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!chatSession.current) {
        setMessages(prev => [...prev, { role: 'user', text: input.trim() }, { role: 'model', text: "I'm currently offline. Please check the API configuration." }]);
        setInput('');
        return;
    }

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const resultStream = await chatSession.current.sendMessageStream({ message: userMsg });
      
      let fullResponse = "";
      // Add a placeholder message for the model
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of resultStream) {
        const text = (chunk as GenerateContentResponse).text;
        if (text) {
          fullResponse += text;
          setMessages(prev => {
            const newArr = [...prev];
            // Update the last message (the model's placeholder)
            newArr[newArr.length - 1] = { role: 'model', text: fullResponse };
            return newArr;
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => {
          const newArr = [...prev];
          // Replace empty placeholder or append error
           if (newArr.length > 0 && newArr[newArr.length - 1].role === 'model' && newArr[newArr.length - 1].text === "") {
               newArr[newArr.length - 1] = { role: 'model', text: "I'm having trouble connecting to the mountains right now. Please try again." };
           } else {
               newArr.push({ role: 'model', text: "I'm having trouble connecting to the mountains right now. Please try again." });
           }
           return newArr;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-black/20">
        <div className="p-2 bg-gradient-to-br from-nepalRed to-nepalBlue rounded-lg shadow-lg">
          <Bot size={24} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white">AI Companion</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-gray-400">Online • gemini-3-pro</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[600px] custom-scrollbar">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
              ${msg.role === 'user' ? 'bg-gold text-black' : 'bg-white/10 text-white'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
            </div>
            
            <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap shadow-lg
              ${msg.role === 'user' 
                ? 'bg-gradient-to-br from-gold/20 to-yellow-600/20 border border-gold/30 text-white rounded-tr-none' 
                : 'bg-black/40 border border-white/10 text-gray-200 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
           <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-white">
                 <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="bg-black/40 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                 <span className="text-xs text-gray-400 animate-pulse">Thinking...</span>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <form onSubmit={handleSend} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Nepal or this portfolio..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-nepalBlue to-blue-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-900/50 transition-all"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;