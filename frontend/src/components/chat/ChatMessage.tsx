'use client';
import { ChatMessage as ChatMessageType } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { AgentActivityTimeline } from './AgentActivityTimeline';
import { RiskCard } from './RiskCard';
import { PFZCard } from './PFZCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "max-w-[85%] rounded-2xl p-4",
        isUser 
          ? "bg-cyan-600/20 text-cyan-50 border border-cyan-500/30 rounded-tr-none" 
          : "bg-white/5 border border-white/10 backdrop-blur-md rounded-tl-none"
      )}>
        {!isUser && message.agent_activity && (
          <AgentActivityTimeline activities={message.agent_activity} />
        )}

        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {!isUser && message.risk_assessment && (
          <RiskCard data={message.risk_assessment} />
        )}

        {!isUser && message.pfz_data && message.pfz_data.length > 0 && (
          <div className="mt-3">
            <h4 className="font-semibold text-sm mb-2 text-cyan-400">Potential Fishing Zones Found:</h4>
            <div className="flex flex-col gap-2">
              {message.pfz_data.map((zone, i) => (
                <PFZCard key={zone.id || i} zone={zone} />
              ))}
            </div>
          </div>
        )}

        {!isUser && message.metadata && (
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            <span>Sources: {message.metadata.source}</span>
            <span>Confidence: {message.metadata.confidence}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
