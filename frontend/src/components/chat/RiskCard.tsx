'use client';
import { RiskAssessment } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { getRiskColor } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AlertTriangle } from 'lucide-react';

interface RiskCardProps {
  data: RiskAssessment;
}

export function RiskCard({ data }: RiskCardProps) {
  const color = getRiskColor(data.risk_level);

  return (
    <GlassCard className="w-full max-w-sm my-3 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2 text-lg">
          Safety Assessment
        </h3>
        <div 
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}
        >
          {data.risk_level}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {data.factors.map((factor, idx) => (
          <div key={idx} className="bg-white/5 p-2 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-200 flex items-center gap-1.5">
                <span>{factor.icon}</span> {factor.name}
              </span>
              <span className="text-slate-400 text-xs">{factor.level}</span>
            </div>
            <ProgressBar 
              value={factor.score} 
              max={factor.max_score} 
              color={getRiskColor(factor.level)} 
            />
          </div>
        ))}
      </div>

      <div className="bg-marine p-3 rounded-lg border border-white/5 text-sm mb-3">
        <p className="font-medium mb-1">Recommendation:</p>
        <p className="text-slate-300">{data.recommendation}</p>
      </div>

      {data.warnings && data.warnings.length > 0 && (
        <div className="flex gap-2 text-sm text-amber-400 bg-amber-400/10 p-2 rounded-lg items-start">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <ul className="list-disc list-inside">
            {data.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
    </GlassCard>
  );
}
