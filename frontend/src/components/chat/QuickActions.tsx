'use client';
import { motion } from 'framer-motion';

interface QuickActionsProps {
  onSelect: (text: string) => void;
}

const ACTIONS = [
  { emoji: '🎣', label: 'Find PFZ', text: 'Find nearest fishing zones near my location' },
  { emoji: '🌊', label: 'Sea Safety', text: 'Is it safe to go fishing today?' },
  { emoji: '🌦', label: 'Weather', text: 'What is the marine weather forecast?' },
  { emoji: '🌀', label: 'Cyclone Alerts', text: 'Are there any cyclone or storm alerts?' },
  { emoji: '🧭', label: 'Safe Route', text: 'Find the safest route to the nearest PFZ' },
  { emoji: '🛰', label: 'Ocean Data', text: 'Show ocean conditions like SST and chlorophyll' },
  { emoji: '🚫', label: 'Restricted', text: 'Are there any restricted zones nearby?' },
];

export function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-2 px-4 w-max">
        {ACTIONS.map((action, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(action.text)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm whitespace-nowrap hover:bg-white/10 hover:border-cyan-500/30 transition-colors"
          >
            <span>{action.emoji}</span>
            <span className="text-slate-200">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
