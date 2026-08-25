'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string; // hex color or tailwind class
  label?: string;
  showValue?: boolean;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  color = '#0ea5e9', 
  label, 
  showValue = false,
  className,
  barClassName
}: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs text-slate-300">
          {label && <span>{label}</span>}
          {showValue && <span>{value}/{max}</span>}
        </div>
      )}
      <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", barClassName)}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
