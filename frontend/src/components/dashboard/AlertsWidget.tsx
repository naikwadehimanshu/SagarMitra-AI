'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const DUMMY_ALERTS = [
  { id: 1, type: 'warning', title: 'High Wind Alert', desc: 'Gusts up to 45km/h expected near coast.', time: '10 mins ago' },
  { id: 2, type: 'critical', title: 'Restricted Zone', desc: 'Naval exercise near Zone A. Avoid area.', time: '1 hr ago' },
  { id: 3, type: 'info', title: 'Weather Update', desc: 'Clear skies expected for the next 12 hours.', time: '2 hrs ago' },
];

export function AlertsWidget() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Active Alerts</h3>
        <a href="/safety" className="text-xs text-cyan-400 hover:underline">View All</a>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {DUMMY_ALERTS.map((alert, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={alert.id} 
            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="mt-0.5">
              {alert.type === 'critical' ? <ShieldAlert size={16} className="text-red-400" /> :
               alert.type === 'warning' ? <AlertTriangle size={16} className="text-amber-400" /> :
               <Info size={16} className="text-cyan-400" />}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
              <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{alert.desc}</p>
              <span className="text-[10px] text-white/40 mt-1 block">{alert.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
