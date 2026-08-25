import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Info, AlertTriangle, ShieldAlert } from 'lucide-react';

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  location?: string;
  timestamp: string;
  expiresAt?: string;
}

export function AlertCard({ alert }: { alert: Alert }) {
  const isCritical = alert.severity === 'critical';
  const isWarning = alert.severity === 'warning';

  return (
    <div className={cn(
      "relative p-4 rounded-xl border backdrop-blur-md overflow-hidden",
      isCritical ? "bg-red-500/10 border-red-500/30" :
      isWarning ? "bg-amber-500/10 border-amber-500/30" :
      "bg-cyan-500/10 border-cyan-500/30"
    )}>
      {/* Left border indicator */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1",
        isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-cyan-500"
      )} />
      
      <div className="flex items-start gap-3 ml-2">
        <div className="mt-1">
          {isCritical ? <ShieldAlert className="text-red-400" size={20} /> :
           isWarning ? <AlertTriangle className="text-amber-400" size={20} /> :
           <Info className="text-cyan-400" size={20} />}
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-white font-semibold">{alert.title}</h4>
          <p className="text-white/70 text-sm leading-relaxed">{alert.description}</p>
          <div className="flex items-center gap-4 text-xs mt-2 text-white/50">
            {alert.location && <span>📍 {alert.location}</span>}
            <span>⏱ {new Date(alert.timestamp).toLocaleTimeString()}</span>
            {alert.expiresAt && <span className="text-red-300/70">Expires: {new Date(alert.expiresAt).toLocaleTimeString()}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
