'use client';
import { useState } from 'react';
import { Layers, Thermometer, Wind, AlertTriangle, Shield, Map as MapIcon, Fish } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CONTROLS = [
  { id: 'pfz', label: 'PFZ Zones', icon: Fish, color: 'text-cyan-400' },
  { id: 'sst', label: 'SST Layer', icon: Thermometer, color: 'text-red-400' },
  { id: 'weather', label: 'Weather', icon: Wind, color: 'text-blue-400' },
  { id: 'risk', label: 'Risk Zones', icon: AlertTriangle, color: 'text-amber-400' },
  { id: 'restricted', label: 'Restricted Areas', icon: Shield, color: 'text-red-500' },
  { id: 'routes', label: 'Active Routes', icon: MapIcon, color: 'text-green-400' },
];

export function MapControls() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(['pfz', 'weather']));

  const toggleLayer = (id: string) => {
    setActiveLayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col items-end">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white hover:bg-white/10 mb-2 transition-colors"
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
            <GlassCard className="w-56 p-3">
              <h3 className="text-sm font-semibold mb-3 px-1 text-slate-200">Map Layers</h3>
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
                        "w-7 h-4 rounded-full transition-colors relative",
                        isActive ? "bg-cyan-500" : "bg-slate-700"
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
