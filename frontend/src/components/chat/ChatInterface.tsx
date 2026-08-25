'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Mic } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useLocation } from '@/hooks/useLocation';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { QuickActions } from './QuickActions';
import { LoadingDots } from '@/components/ui/LoadingDots';

export function ChatInterface() {
  const { messages, isLoading, sendMessage } = useChat();
  const { location } = useLocation();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input, location);
    setInput('');
  };

  const handleQuickAction = (text: string) => {
    if (isLoading) return;
    sendMessage(text, location);
  };

  return (
    <div className="flex flex-col h-full bg-navy/80 backdrop-blur-xl border-l border-white/10">
      <div className="p-4 border-b border-white/10 flex items-center justify-between glass sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
            🤖
          </div>
          <div>
            <h2 className="font-semibold text-slate-100 text-sm">SagarMitra Assistant</h2>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Multi-Agent AI
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 text-slate-400">
            <div className="text-4xl mb-4">🌊</div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">How can I help you navigate today?</h3>
            <p className="text-sm max-w-sm mb-6">Ask me about weather conditions, find fishing zones, or plan a safe route.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <ChatMessageComponent key={idx} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 text-slate-400 p-4">
                🤖 <LoadingDots />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 bg-navy border-t border-white/10">
        <div className="mb-3">
          <QuickActions onSelect={handleQuickAction} />
        </div>
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <button type="button" className="absolute left-3 text-slate-400 hover:text-cyan-400 transition-colors">
            <MapPin size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about marine conditions..."
            disabled={isLoading}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-10 pr-24 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all text-white placeholder:text-slate-500"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button type="button" className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <Mic size={18} />
            </button>
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="p-2 bg-cyan-500 text-navy rounded-full disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-400 hover:bg-cyan-400 transition-colors"
            >
              <Send size={18} className={input.trim() && !isLoading ? "ml-0.5" : ""} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
