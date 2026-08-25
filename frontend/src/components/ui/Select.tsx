import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ options, value, onChange, placeholder, className }: SelectProps) {
  return (
    <div className={cn("relative inline-block w-full", className)}>
      <select
        className="w-full appearance-none bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="" disabled className="bg-slate-900">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white/50">
        <ChevronDown size={16} />
      </div>
    </div>
  );
}
