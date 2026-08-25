import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <div className={cn("flex items-center space-x-3 cursor-pointer", className)} onClick={() => onChange(!checked)}>
      <div className={cn(
        "relative w-12 h-6 rounded-full transition-colors duration-300 flex items-center px-1",
        checked ? "bg-cyan-500/50 border border-cyan-400" : "bg-white/10 border border-white/20"
      )}>
        <motion.div
          layout
          className="w-4 h-4 bg-white rounded-full shadow-md"
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
      {label && <span className={cn("text-sm font-medium transition-colors", checked ? "text-cyan-400" : "text-white/60")}>{label}</span>}
    </div>
  );
}
