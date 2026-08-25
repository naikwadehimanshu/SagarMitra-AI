import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RiskGaugeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

export function RiskGauge({ score, size = 'md' }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const dimensions = {
    sm: { width: 120, strokeWidth: 8, fontSize: 'text-2xl' },
    md: { width: 200, strokeWidth: 12, fontSize: 'text-4xl' },
    lg: { width: 300, strokeWidth: 16, fontSize: 'text-6xl' },
  };

  const { width, strokeWidth, fontSize } = dimensions[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  let color = '#4ade80'; // green-400
  let label = 'LOW RISK';
  if (score >= 30) { color = '#fbbf24'; label = 'MODERATE'; } // amber-400
  if (score >= 70) { color = '#fb923c'; label = 'HIGH RISK'; } // orange-400
  if (score >= 90) { color = '#f87171'; label = 'EXTREME'; } // red-400

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width, height: width }}>
      <svg width={width} height={width} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={cn("font-bold text-white", fontSize)}>{score}</span>
        <span className="text-xs font-medium uppercase tracking-wider mt-1" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}
