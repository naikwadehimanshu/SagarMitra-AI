'use client';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { MapControls } from '@/components/maps/MapControls';
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
    <div className="h-screen flex flex-col overflow-hidden bg-navy">
      <Header />
      
      <div className="flex-1 flex mt-16 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 relative">
          
          {/* Map Section - Takes 2/3 space on large screens */}
          <div className="lg:col-span-2 relative h-[50vh] lg:h-full">
            <MapView />
            <MarineConditionsCard />
            <MapControls />
            
            {/* Alert Strip Below Map (Mobile) / Absolute Bottom (Desktop) */}
            <div className="absolute bottom-0 left-0 right-0 bg-amber-500/20 backdrop-blur-md border-t border-amber-500/30 p-2 text-xs flex items-center justify-center gap-2 text-amber-200 z-10">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <strong>Warning:</strong> High swell (2.5m) expected in deep sea sectors off West Coast after 18:00 HRS.
            </div>
          </div>

          {/* Chat Interface - Takes 1/3 space on large screens */}
          <div className="lg:col-span-1 h-[50vh] lg:h-full relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
            <ChatInterface />
          </div>

        </main>
      </div>
    </div>
  );
}
