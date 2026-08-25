import React from 'react';
import { RouteData, RouteCard } from './RouteCard';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface RouteComparisonProps {
  routes: RouteData[];
  recommendation: string;
}

export function RouteComparison({ routes, recommendation }: RouteComparisonProps) {
  if (routes.length < 2) return null;

  const [route1, route2] = routes;

  const betterDistance = route1.distance <= route2.distance ? 0 : 1;
  const betterDuration = route1.duration <= route2.duration ? 0 : 1;
  const betterRisk = route1.riskScore <= route2.riskScore ? 0 : 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RouteCard route={route1} isRecommended={betterRisk === 0} onSelect={() => {}} />
        <RouteCard route={route2} isRecommended={betterRisk === 1} onSelect={() => {}} />
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Metric Comparison</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
            <span className="w-1/3 text-white/50">Distance</span>
            <span className={cn("w-1/3 text-center", betterDistance === 0 ? "text-green-400" : "text-white")}>{route1.distance} km</span>
            <span className={cn("w-1/3 text-right", betterDistance === 1 ? "text-green-400" : "text-white")}>{route2.distance} km</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
            <span className="w-1/3 text-white/50">Duration</span>
            <span className={cn("w-1/3 text-center", betterDuration === 0 ? "text-green-400" : "text-white")}>{route1.duration} hrs</span>
            <span className={cn("w-1/3 text-right", betterDuration === 1 ? "text-green-400" : "text-white")}>{route2.duration} hrs</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
            <span className="w-1/3 text-white/50">Risk Score</span>
            <span className={cn("w-1/3 text-center font-bold", betterRisk === 0 ? "text-green-400" : "text-red-400")}>{route1.riskScore}</span>
            <span className={cn("w-1/3 text-right font-bold", betterRisk === 1 ? "text-green-400" : "text-red-400")}>{route2.riskScore}</span>
          </div>
        </div>
        
        <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl text-cyan-100 text-sm leading-relaxed">
          <strong className="text-cyan-400 block mb-1">AI Recommendation:</strong>
          {recommendation}
        </div>
      </div>
    </div>
  );
}
