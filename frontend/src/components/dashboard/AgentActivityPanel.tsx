'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, Loader2, XCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AgentActivityPanel() {
  const [isOpen, setIsOpen] = useState(true);

  const steps = [
    { id: 1, name: 'Analyzing query intent', status: 'done', duration: '0.2s' },
    { id: 2, name: 'Fetching INCOIS SST data', status: 'done', duration: '1.1s' },
    { id: 3, name: 'Evaluating weather conditions', status: 'done', duration: '0.8s' },
    { id: 4, name: 'Running risk assessment model', status: 'running', duration: null },
    { id: 5, name: 'Formulating response', status: 'pending', duration: null },
  ];

  return (
    <div className="fixed right-0 top-20 bottom-0 z-40 flex">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-8 top-4 bg-slate-900 border border-white/10 border-r-0 rounded-l-xl p-1 text-white/50 hover:text-white"
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-slate-900/95 backdrop-blur-xl border-l border-white/10 h-full overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <Brain className="text-cyan-400" size={20} />
              <h3 className="text-white font-bold whitespace-nowrap">AI Reasoning</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {steps.map((step) => (
                <div key={step.id} className="flex gap-3">
                  <div className="mt-0.5">
                    {step.status === 'done' ? <CheckCircle size={16} className="text-green-400" /> :
                     step.status === 'running' ? <Loader2 size={16} className="text-cyan-400 animate-spin" /> :
                     step.status === 'failed' ? <XCircle size={16} className="text-red-400" /> :
                     <div className="w-4 h-4 rounded-full border-2 border-white/20" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm transition-colors", step.status === 'pending' ? 'text-white/40' : 'text-white/90')}>
                      {step.name}
                    </p>
                    {step.duration && <span className="text-[10px] text-white/40">{step.duration}</span>}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="text-xs text-white/50 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" /> Agent is currently synthesizing data...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
