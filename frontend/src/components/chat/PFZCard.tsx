'use client';
import { PFZZone } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Map, Navigation, Thermometer, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface PFZCardProps {
  zone: PFZZone;
}

export function PFZCard({ zone }: PFZCardProps) {
  return (
    <GlassCard className="w-full max-w-sm my-2 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold flex items-center gap-2">
            🐟 {zone.name}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            {zone.distance_km?.toFixed(1)} km {zone.direction}
          </p>
        </div>
        <Badge 
          text={`${zone.suitability_score}% Match`} 
          variant={zone.suitability_score > 80 ? 'success' : 'warning'} 
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="bg-black/20 p-2 rounded-lg">
          <span className="text-slate-400 text-xs block mb-1">SST</span>
          <span className="flex items-center gap-1 text-slate-200">
            <Thermometer size={14} className="text-red-400"/> {zone.sst}°C
          </span>
        </div>
        <div className="bg-black/20 p-2 rounded-lg">
          <span className="text-slate-400 text-xs block mb-1">Chlorophyll</span>
          <span className="flex items-center gap-1 text-slate-200">
            <Info size={14} className="text-green-400"/> {zone.chlorophyll} mg/m³
          </span>
        </div>
      </div>

      <div className="mb-4">
        <ProgressBar 
          value={zone.suitability_score} 
          max={100} 
          label="Overall Suitability" 
          color="#22c55e" 
        />
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-white/10 hover:bg-white/20 transition-colors py-2 rounded-lg text-sm flex items-center justify-center gap-2">
          <Map size={14} /> View on Map
        </button>
        <button className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-navy font-medium transition-colors py-2 rounded-lg text-sm flex items-center justify-center gap-2">
          <Navigation size={14} /> Route
        </button>
      </div>
    </GlassCard>
  );
}
