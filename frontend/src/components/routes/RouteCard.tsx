import React from 'react';
import { cn } from '@/lib/utils';
import { Map, Clock, ShieldAlert, CheckCircle } from 'lucide-react';

export interface RouteData {
  id: string;
  name: string;
  type: 'Fastest' | 'Safest';
  distance: number;
  duration: number;
  riskScore: number;
  hazards: string[];
}

interface RouteCardProps {
  route: RouteData;
  isRecommended?: boolean;
  onSelect?: () => void;
}

export function RouteCard({ route, isRecommended, onSelect }: RouteCardProps) {
  const isSafe = route.riskScore < 30;
  const isModerate = route.riskScore >= 30 && route.riskScore < 70;

  return (
    <div className={cn(
      "bg-white/5 backdrop-blur-xl rounded-2xl p-6 transition-all",
      isRecommended ? "border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "border border-white/10",
      "hover:bg-white/10"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {route.name}
            {isRecommended && (
              <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1">
                <CheckCircle size={12} /> Recommended
              </span>
            )}
          </h3>
          <span className="text-sm text-white/50">{route.type} Route</span>
        </div>
        <div className={cn(
          "text-2xl font-bold rounded-lg px-3 py-1",
          isSafe ? "text-green-400 bg-green-500/10" : 
          isModerate ? "text-amber-400 bg-amber-500/10" : "text-red-400 bg-red-500/10"
        )}>
          {route.riskScore}
          <div className="text-[10px] uppercase text-center opacity-70">Risk Score</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-white/40 text-xs flex items-center gap-1"><Map size={14}/> Distance</span>
          <span className="text-white font-medium">{route.distance.toFixed(1)} km</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-white/40 text-xs flex items-center gap-1"><Clock size={14}/> Duration</span>
          <span className="text-white font-medium">{route.duration.toFixed(1)} hours</span>
        </div>
      </div>

      {route.hazards.length > 0 && (
        <div className="mb-6">
          <span className="text-white/40 text-xs mb-2 flex items-center gap-1"><ShieldAlert size={14}/> Hazards</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {route.hazards.map((hazard, idx) => (
              <span key={idx} className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-1 rounded-md">
                {hazard}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onSelect}
        className={cn(
          "w-full py-3 rounded-xl font-medium transition-colors",
          isRecommended 
            ? "bg-cyan-500 text-slate-900 hover:bg-cyan-400" 
            : "bg-white/10 text-white hover:bg-white/20"
        )}
      >
        Select Route
      </button>
    </div>
  );
}
