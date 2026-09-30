'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/maps/MapView'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-marine flex items-center justify-center">
      <div className="text-cyan-500 animate-pulse">Loading Map...</div>
    </div>
  )
});

export default function GeofencePage() {
  const zones = [
    { id: 1, name: 'Naval Training Sector C', type: 'restricted', dist: '5.2 km', desc: 'Active live-fire training exercise.', level: 'CRITICAL' },
    { id: 2, name: 'Marine National Park', type: 'protected', dist: '12.4 km', desc: 'No fishing allowed. Ecological reserve.', level: 'WARNING' },
    { id: 3, name: 'Deep Water Port Approach', type: 'caution', dist: '18.1 km', desc: 'High traffic commercial shipping lane.', level: 'INFO' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full overflow-y-auto p-4 md:p-8 pb-24 custom-scrollbar w-full flex flex-col">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <ShieldAlert className="text-cyan-400" size={32} />
        Geofence Monitor
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* List Panel */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col h-full overflow-y-auto">
          <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl mb-6 shrink-0">
            <h3 className="text-green-400 font-bold mb-1">Status: SAFE</h3>
            <p className="text-sm text-green-100/80">You are currently outside all restricted zones. Nearest boundary is 5.2 km away.</p>
          </div>

          <h2 className="text-xl font-bold text-white mb-4 shrink-0">Monitored Zones</h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {zones.map(zone => (
              <motion.div key={zone.id} whileHover={{ scale: 1.02 }} className="bg-slate-800/50 border border-white/5 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">{zone.name}</h4>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full",
                    zone.level === 'CRITICAL' ? "bg-red-500/20 text-red-400" :
                    zone.level === 'WARNING' ? "bg-amber-500/20 text-amber-400" :
                    "bg-cyan-500/20 text-cyan-400"
                  )}>{zone.type.toUpperCase()}</span>
                </div>
                <p className="text-sm text-white/60 mb-3">{zone.desc}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">Distance: {zone.dist}</span>
                  <button className="text-cyan-400 hover:underline">Show on map</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Map Panel */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl lg:col-span-2 relative overflow-hidden flex flex-col min-h-[400px]">
          <div className="w-full flex-1 relative overflow-hidden">
             <MapView />
          </div>
        </div>
      </div>
    </div>
  );
}
