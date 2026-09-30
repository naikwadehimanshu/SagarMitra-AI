'use client';
import { useState } from 'react';
import { AgentActivity } from '@/types';
import { CheckCircle2, Clock, XCircle, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentActivityTimelineProps {
  activities: AgentActivity[];
}

export function AgentActivityTimeline({ activities }: AgentActivityTimelineProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!activities || activities.length === 0) return null;

  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-medium transition-colors"
      >
        <BrainCircuit size={14} />
        {isOpen ? 'Hide Reasoning' : 'Show Reasoning'}
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl bg-navy/40 border border-white/5 p-4 text-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              <div className="text-slate-300 font-bold mb-4 uppercase tracking-widest text-xs border-b border-white/10 pb-2">
                ORCA Agent Trace
              </div>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/50 before:via-blue-500/20 before:to-transparent">
                {activities.map((activity, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative flex items-start gap-4"
                  >
                    <div className="bg-navy rounded-full p-0.5 relative z-10 mt-0.5 shrink-0 border border-white/10">
                      {activity.status === 'completed' && <CheckCircle2 size={16} className="text-green-500" />}
                      {activity.status === 'running' && <Clock size={16} className="text-amber-500 animate-pulse" />}
                      {activity.status === 'failed' && <XCircle size={16} className="text-red-500" />}
                    </div>
                    <div>
                      <span className="font-semibold text-cyan-50 block text-sm">{idx + 1}. {activity.agent_name}</span>
                      <span className="text-slate-400 text-sm mt-0.5 block">{activity.description}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
