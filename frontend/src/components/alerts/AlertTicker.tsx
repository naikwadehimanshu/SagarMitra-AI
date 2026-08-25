import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { Alert } from './AlertCard';
import { cn } from '@/lib/utils';

export function AlertTicker({ alerts }: { alerts: Alert[] }) {
  const [expanded, setExpanded] = useState(false);
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');

  if (criticalAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <AnimatePresence>
        {expanded ? (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900/95 border-t border-red-500/30 backdrop-blur-xl p-4 max-h-64 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-red-400 font-bold flex items-center gap-2">
                <AlertCircle size={18} /> Active Critical Alerts
              </h3>
              <button onClick={() => setExpanded(false)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {criticalAlerts.map(alert => (
                <div key={alert.id} className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm text-red-100">
                  <span className="font-bold mr-2">{alert.title}:</span>
                  {alert.description}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="bg-red-500/90 text-white px-4 py-2 cursor-pointer flex items-center gap-3 overflow-hidden"
            onClick={() => setExpanded(true)}
          >
            <AlertCircle size={18} className="flex-shrink-0 animate-pulse" />
            <div className="flex-1 overflow-hidden relative h-6">
              <motion.div
                animate={{ x: [0, -1000] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="whitespace-nowrap absolute whitespace-nowrap"
              >
                {criticalAlerts.map(a => `${a.title}: ${a.description} • `).join(' ')}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
