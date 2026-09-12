'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { useMap } from './MapProvider';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function MapLegend() {
  const [isOpen, setIsOpen] = useState(true);
  const { activeLayers } = useMap();

  if (activeLayers.size === 0) return null;

  return (
    <div className="absolute bottom-6 right-4 z-10 w-48">
      <GlassCard className="p-0 shadow-xl overflow-hidden">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 text-sm font-semibold bg-white/5 hover:bg-white/10 transition-colors"
        >
          <span>Legend</span>
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        
        {isOpen && (
          <div className="p-3 space-y-2 text-xs border-t border-white/10 bg-black/20">
            {activeLayers.has('ship') && (
              <>
                <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center border border-white text-[10px]">🚢</span> Commercial Ship</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center border border-white text-[10px]">🎣</span> Fishing Vessel</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border border-white text-[10px]">🚢</span> Vessel in Danger</div>
              </>
            )}
            {activeLayers.has('port') && (
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center border border-white text-[10px]">⚓</span> Port</div>
            )}
            {activeLayers.has('fishing_zone') && (
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center border border-white text-[10px]">🐟</span> Potential Fishing Zone</div>
            )}
            {activeLayers.has('temperature') && (
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-400 flex items-center justify-center border border-white text-[10px]">🌡</span> High Temp Area</div>
            )}
            {activeLayers.has('weather') && (
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-400 flex items-center justify-center border border-white text-[10px]">🌪</span> Weather / Storm</div>
            )}
            {activeLayers.has('hazard') && (
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center border border-white text-[10px]">⚠️</span> Hazard Area</div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
