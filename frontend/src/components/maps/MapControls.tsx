'use client';
import { useState } from 'react';
import { Layers, Thermometer, Wind, AlertTriangle, Map as MapIcon, Fish, Anchor } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useMap, LayerType } from './MapProvider';

const CONTROLS: { id: LayerType; label: string; icon: any; color: string }[] = [
  { id: 'ship', label: 'Vessels / Ships', icon: Anchor, color: 'text-slate-400' },
  { id: 'fishing_zone', label: 'PFZ Zones', icon: Fish, color: 'text-cyan-400' },
  { id: 'temperature', label: 'SST Layer', icon: Thermometer, color: 'text-red-400' },
  { id: 'weather', label: 'Weather', icon: Wind, color: 'text-blue-400' },
  { id: 'hazard', label: 'Hazards', icon: AlertTriangle, color: 'text-amber-400' },
  { id: 'port', label: 'Ports', icon: MapIcon, color: 'text-green-400' },
];

export function MapControls() {
  const [isOpen, setIsOpen] = useState(true);
  const { activeLayers, toggleLayer } = useMap();

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col items-end">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white hover:bg-white/10 mb-2 transition-colors shadow-lg"
      >
        <Layers size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard className="w-56 p-3 shadow-xl">
              <h3 className="text-sm font-semibold mb-3 px-1 text-slate-200 border-b border-white/10 pb-2">Map Layers</h3>
              <div className="flex flex-col gap-1.5">
                {CONTROLS.map(control => {
                  const isActive = activeLayers.has(control.id);
                  const Icon = control.icon;
                  return (
                    <button
                      key={control.id}
                      onClick={() => toggleLayer(control.id)}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors text-left",
                        isActive ? "bg-white/10" : "hover:bg-white/5 text-slate-400"
                      )}
                    >
                      <Icon size={16} className={isActive ? control.color : "text-slate-500"} />
                      <span className="flex-1">{control.label}</span>
                      <div className={cn(
                        "w-7 h-4 rounded-full transition-colors relative border border-white/10",
                        isActive ? "bg-cyan-500" : "bg-slate-800"
                      )}>
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform",
                          isActive ? "translate-x-3" : "translate-x-0"
                        )} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
