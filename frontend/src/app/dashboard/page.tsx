'use client';
import dynamic from 'next/dynamic';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { MapControls } from '@/components/maps/MapControls';
import { MapLegend } from '@/components/maps/MapLegend';
import { MarineConditionsCard } from '@/components/maps/MarineConditionsCard';

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
  return (
    <div className="w-full h-full flex flex-col lg:flex-row relative overflow-hidden min-h-0">
      
      {/* Map Section - Takes 2/3 space on large screens, 1/2 on mobile */}
      <div className="w-full h-1/2 lg:h-full lg:w-2/3 relative min-h-0 flex flex-col shrink-0 border-b lg:border-b-0 lg:border-r border-white/10">
        <MapView />
        <MarineConditionsCard />
        <MapControls />
        <MapLegend />
        
        {/* Alert Strip Below Map (Mobile) / Absolute Bottom (Desktop) */}
        <div className="absolute bottom-0 left-0 right-0 bg-amber-500/95 backdrop-blur-xl border-t border-amber-400 p-2.5 text-xs sm:text-sm flex items-center justify-center gap-3 text-black shadow-[0_-4px_20px_rgba(245,158,11,0.3)] z-10 font-medium">
          <div className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </div>
          <p><strong>Warning:</strong> High swell (2.5m) expected in deep sea sectors off West Coast after 18:00 HRS.</p>
        </div>
      </div>

      {/* Chat Interface - Takes 1/3 space on large screens, 1/2 on mobile */}
      <div className="w-full h-1/2 lg:h-full lg:w-1/3 relative z-20 min-h-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col shrink-0 bg-navy">
        <ChatInterface />
      </div>

    </div>
  );
}
