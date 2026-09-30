'use client';

import React, { useState } from 'react';
import { MessageSquare, Calendar, MapPin, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function ConversationsPage() {
  const router = useRouter();
  const [history, setHistory] = useState([
    { id: 1, title: 'Safe route to Alpha Zone in afternoon?', date: 'Today, 10:45 AM', loc: 'Mumbai', msgs: 4 },
    { id: 2, title: 'Cyclone warning check', date: 'Yesterday, 14:20 PM', loc: 'Chennai', msgs: 6 },
    { id: 3, title: 'PFZ suitability for next 3 days', date: 'Aug 23, 09:15 AM', loc: 'Kochi', msgs: 3 },
  ]);

  const clearHistory = () => {
    setHistory([]);
  };

  const startNewChat = () => {
    // In a real app, this would clear the chat context as well.
    router.push('/dashboard');
  };

  const deleteChat = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-full overflow-y-auto p-4 md:p-8 pb-24 custom-scrollbar w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="text-cyan-400" size={32} />
          Conversation History
        </h1>
        <button onClick={startNewChat} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-xl font-bold transition-colors">
          <Plus size={18} /> New Chat
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Chats</h2>
          {history.length > 0 && (
            <button onClick={clearHistory} className="text-sm text-red-400 hover:underline">Clear History</button>
          )}
        </div>

        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-8 text-white/40 border border-dashed border-white/10 rounded-xl">
              No conversations found.
            </div>
          ) : (
            history.map(chat => (
              <div key={chat.id} onClick={startNewChat} className="group flex items-center justify-between bg-slate-800/50 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 p-4 rounded-xl cursor-pointer transition-all">
                <div className="flex flex-col">
                  <span className="font-medium text-white mb-1 group-hover:text-cyan-400 transition-colors">{chat.title}</span>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {chat.date}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {chat.loc}</span>
                    <span>{chat.msgs} messages</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={(e) => deleteChat(e, chat.id)} className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight className="text-white/20 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mt-8">
         <h2 className="text-xl font-bold text-white mb-6">Saved Analyses</h2>
         <div className="text-center py-8 text-white/40 border-2 border-dashed border-white/10 rounded-xl">
           No saved analyses found. Click the "Save" icon on any route or safety assessment to store it here.
         </div>
      </div>
    </div>
  );
}
