'use client';
import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { useLocation } from '@/hooks/useLocation';
import { ChevronDown, ChevronUp, Waves, Thermometer, Wind, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MarineConditionsCard() {
  const { locationName } = useLocation();
  const [expanded, setExpanded] = useState(false);

  // Mock data for prototype
  const conditions = {
    risk: 'MODERATE',
    sst: 28.5,
    waveHeight: 1.2,
    wind: 15,
    visibility: 8,
    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  };

  return (
    <div className="absolute top-4 left-4 z-10">
      <GlassCard className="w-64 p-0 overflow-hidden">
        <div 
          className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-sm truncate max-w-[140px]">{locationName}</h3>
              <p className="text-xs text-slate-400">{conditions.time}</p>
            </div>
            <Badge 
              text={conditions.risk} 
              variant={conditions.risk === 'MODERATE' ? 'warning' : 'success'} 
              size="sm"
            />
          </div>
          
          <div className="flex justify-between items-center text-xs mt-3">
            <span className="flex items-center gap-1 text-slate-300"><Thermometer size={14} className="text-red-400"/> {conditions.sst}°C</span>
            <span className="flex items-center gap-1 text-slate-300"><Waves size={14} className="text-cyan-400"/> {conditions.waveHeight}m</span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 bg-black/20"
            >
              <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Wind size={12}/> Wind</p>
                  <p>{conditions.wind} km/h NW</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Eye size={12}/> Visibility</p>
                  <p>{conditions.visibility} km</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 text-xs mb-1">Status</p>
                  <p className="text-amber-400 text-xs">Caution advised for small vessels due to upcoming swell.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
