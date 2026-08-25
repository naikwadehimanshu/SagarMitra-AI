'use client';
import { AgentActivity } from '@/types';
import { CheckCircle2, Clock, XCircle, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentActivityTimelineProps {
  activities: AgentActivity[];
}

export function AgentActivityTimeline({ activities }: AgentActivityTimelineProps) {
  if (!activities || activities.length === 0) return null;

  return (
    <div className="mt-3 mb-2 rounded-xl bg-navy/40 border border-white/5 p-3 text-sm">
      <div className="flex items-center gap-2 mb-3 text-cyan-400 font-medium text-xs uppercase tracking-wider">
        <BrainCircuit size={14} />
        <span>Multi-Agent Reasoning</span>
      </div>
      <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
        {activities.map((activity, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex items-start gap-3"
          >
            <div className="bg-navy rounded-full p-0.5 relative z-10 mt-0.5">
              {activity.status === 'completed' && <CheckCircle2 size={16} className="text-green-500" />}
              {activity.status === 'running' && <Clock size={16} className="text-amber-500 animate-pulse" />}
              {activity.status === 'failed' && <XCircle size={16} className="text-red-500" />}
            </div>
            <div>
              <span className="font-medium text-slate-200 block text-xs">{activity.agent_name}</span>
              <span className="text-slate-400 text-xs">{activity.description}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
