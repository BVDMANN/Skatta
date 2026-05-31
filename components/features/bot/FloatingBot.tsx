"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Mic, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FloatingBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    {
      role: 'bot',
      text: "Salut chef ! Je suis ton guide Skatta. Tu cherches un bon plan ou tu veux recruter quelqu'un de sérieux ? Dis-moi tout, on gère ça vite.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 700));
    setMessages(prev => [
      ...prev,
      {
        role: 'bot',
        text: "C'est carré. Pour trouver vite, indique ton quartier, ton métier et ton tarif journalier. Je peux aussi t'aider à repérer les offres urgentes à Libreville ou Port-Gentil.",
      },
    ]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-24 sm:bottom-8 sm:right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40, rotate: -5 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="glass w-[calc(100vw-2rem)] max-w-[360px] h-[min(600px,calc(100vh-9rem))] rounded-[2rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/60 mb-5"
          >
            <div className="bg-skatta-green p-6 sm:p-7 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Sparkles size={24} className="text-skatta-yellow" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xl block leading-none tracking-tight">Skatta Bot</span>
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">En ligne pour toi, Chef</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 no-scrollbar bg-gradient-to-b from-white via-white to-skatta-ghost">
              {messages.map((msg, i) => (
                <motion.div
                  key={`${msg.role}-${i}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.06 }}
                  className={cn(
                    "max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-sm font-medium",
                    msg.role === 'user'
                      ? "bg-skatta-blue text-white ml-auto rounded-tr-none"
                      : "bg-white text-skatta-blue mr-auto rounded-tl-none border border-gray-100"
                  )}
                >
                  {msg.text}
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-1.5 p-5 mr-auto bg-gray-100 rounded-[2rem] rounded-tl-none">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                </div>
              )}
            </div>

            <div className="p-5 sm:p-7 bg-white border-t border-gray-100 flex gap-3 sm:gap-4 items-center">
              <button className="p-3 text-gray-300 hover:text-skatta-green transition-all hover:bg-skatta-green/5 rounded-full">
                <Mic size={24} />
              </button>
              <div className="relative flex-1">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-gray-100 border-none rounded-2xl py-4 px-5 text-sm outline-none focus:ring-4 focus:ring-skatta-green/10 transition-all placeholder:text-gray-400"
                  placeholder="Pose ta question, Chef..."
                />
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="p-4 bg-skatta-green text-white rounded-2xl shadow-xl shadow-skatta-green/40 active:scale-90 transition-all disabled:opacity-50"
              >
                <Send size={22} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-skatta-green text-white shadow-[0_15px_40px_rgba(0,100,0,0.4)] flex items-center justify-center cursor-pointer border-4 border-white hover:shadow-skatta-green/60 transition-all duration-500"
      >
        <div className="relative">
          <MessageCircle className="h-7 w-7 sm:h-9 sm:w-9" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-skatta-yellow rounded-full border-2 border-white animate-pulse" />
        </div>
      </motion.button>
    </div>
  );
};
