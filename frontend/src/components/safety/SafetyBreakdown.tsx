import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface RiskFactor {
  name: string;
  icon: string;
  score: number;
  max: number;
  description: string;
}

interface SafetyBreakdownProps {
  factors: RiskFactor[];
}

export function SafetyBreakdown({ factors }: SafetyBreakdownProps) {
  return (
    <div className="space-y-4">
      {factors.map((factor, index) => {
        const percentage = (factor.score / factor.max) * 100;
        let colorClass = "bg-green-400";
        let level = "LOW";
        if (percentage >= 30) { colorClass = "bg-amber-400"; level = "MODERATE"; }
        if (percentage >= 70) { colorClass = "bg-orange-400"; level = "HIGH"; }
        if (percentage >= 90) { colorClass = "bg-red-500"; level = "EXTREME"; }

        return (
          <div key={factor.name} className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{factor.icon}</span>
                <span className="font-semibold text-white">{factor.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-sm bg-white/10", colorClass.replace('bg-', 'text-'))}>
                  {level}
                </span>
                <span className="text-sm text-white/70">{factor.score} / {factor.max}</span>
              </div>
            </div>
            
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={cn("h-full rounded-full", colorClass)}
              />
            </div>
            
            <p className="text-xs text-white/50">{factor.description}</p>
          </div>
        );
      })}
    </div>
  );
}
