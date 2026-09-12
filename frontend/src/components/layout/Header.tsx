'use client';
import { motion } from 'framer-motion';
import { MapPin, Bell, Globe, User } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';

export function Header() {
  const { locationName } = useLocation();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 h-16 z-50 glass border-b border-white/10 px-4 md:px-6 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">🌊</span>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 hidden md:block">
          Navik AI
        </h1>
        <div className="ml-4 flex items-center gap-2 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">AI Online</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
        <MapPin size={16} className="text-cyan-400" />
        <span className="truncate max-w-[150px] md:max-w-xs">{locationName || 'Detecting location...'}</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white" title="Language">
          <Globe size={20} />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white relative" title="Notifications">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0a1628]" />
        </button>
        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold border border-white/20">
          U
        </button>
      </div>
    </motion.header>
  );
}
