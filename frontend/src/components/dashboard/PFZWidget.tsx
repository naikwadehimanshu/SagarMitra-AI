'use client';

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

const DUMMY_PFZ = [
  { id: 1, name: 'Zone Alpha', dist: '12 km', dir: 'NW', score: 85, risk: 'LOW' },
  { id: 2, name: 'Zone Beta', dist: '18 km', dir: 'SW', score: 72, risk: 'MODERATE' },
  { id: 3, name: 'Zone Gamma', dist: '25 km', dir: 'N', score: 90, risk: 'LOW' },
];

export function PFZWidget() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Nearby Fishing Zones</h3>
        <a href="/dashboard/intelligence" className="text-xs text-cyan-400 hover:underline">View Map</a>
      </div>
      
      <div className="space-y-4">
        {DUMMY_PFZ.map((zone) => (
          <div key={zone.id} className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-white">{zone.name}</span>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-bold",
                zone.risk === 'LOW' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
              )}>
                {zone.risk} RISK
              </span>
            </div>
            <div className="flex justify-between text-xs text-white/60 mb-2">
              <span className="flex items-center gap-1"><Navigation size={12} /> {zone.dist} ({zone.dir})</span>
              <span>Score: {zone.score}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full", zone.score > 80 ? "bg-cyan-400" : "bg-cyan-600")} 
                style={{ width: `${zone.score}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-2 text-sm text-center border border-cyan-500/30 text-cyan-400 rounded-xl hover:bg-cyan-500/10 transition-colors">
        View All Zones
      </button>
    </div>
  );
}
