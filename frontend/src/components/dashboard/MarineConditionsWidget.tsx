'use client';

import React from 'react';
import { Thermometer, Wind, Eye, CloudRain, Droplets, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MarineConditionsWidget() {
  const conditions = [
    { label: 'SST', value: '28.5°C', icon: Thermometer, status: 'Optimal', color: 'text-cyan-400' },
    { label: 'Wave Height', value: '1.2m', icon: Activity, status: 'Calm', color: 'text-green-400' },
    { label: 'Wind', value: '15 km/h NW', icon: Wind, status: 'Moderate', color: 'text-amber-400' },
    { label: 'Visibility', value: '10 km', icon: Eye, status: 'Clear', color: 'text-green-400' },
    { label: 'Sea State', value: 'Slight', icon: Droplets, status: 'Safe', color: 'text-green-400' },
    { label: 'Precipitation', value: '0 mm', icon: CloudRain, status: 'None', color: 'text-cyan-400' },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Current Conditions</h3>
      <div className="grid grid-cols-2 gap-4">
        {conditions.map((item, idx) => (
          <div key={idx} className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <item.icon size={16} className={item.color} />
              <span className="text-xs text-white/60">{item.label}</span>
            </div>
            <span className="text-lg font-bold text-white mb-1">{item.value}</span>
            <span className={cn("text-[10px] uppercase font-bold", item.color)}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
