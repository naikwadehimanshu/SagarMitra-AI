'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { MapControls } from '@/components/maps/MapControls';
import { MapLegend } from '@/components/maps/MapLegend';
import { MarineConditionsCard } from '@/components/maps/MarineConditionsCard';
import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import MapView to avoid SSR issues with MapLibre
const MapView = dynamic(() => import('@/components/maps/MapView'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-marine flex items-center justify-center">
      <div className="text-cyan-500 animate-pulse">Loading Map...</div>
    </div>
  )
});

export default function Dashboard() {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="w-full h-full flex relative overflow-hidden min-h-0 bg-navy">
      
      {/* Map Section - Takes full space */}
      <div className="w-full h-full relative min-h-0 flex flex-col shrink-0">
        <MapView />
        <MarineConditionsCard />
        <MapControls />
        <MapLegend />
        
        {/* Toggle Chat Button */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="absolute bottom-20 right-4 z-20 glass bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 p-3 rounded-full shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all"
          >
            <MessageSquare size={24} />
          </button>
        )}
        
        {/* Alert Strip Below Map */}
        <div className="absolute bottom-0 left-0 right-0 bg-amber-500/95 backdrop-blur-xl border-t border-amber-400 p-2.5 text-xs sm:text-sm flex items-center justify-center gap-3 text-black shadow-[0_-4px_20px_rgba(245,158,11,0.3)] z-10 font-medium">
          <div className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </div>
          <p><strong>Warning:</strong> High swell (2.5m) expected in deep sea sectors off West Coast after 18:00 HRS.</p>
        </div>
      </div>

      {/* Collapsible Chat Drawer */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute top-0 right-0 h-full w-full sm:w-[450px] z-30 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col bg-navy border-l border-white/10"
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
              <h2 className="font-bold flex items-center gap-2 text-cyan-400">
                <MessageSquare size={18} /> ORCA Assistant
              </h2>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
              <ChatInterface />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
