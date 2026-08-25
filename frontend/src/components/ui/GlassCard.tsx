'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  const baseStyles = 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 transition-all duration-300';
  
  if (onClick || hover) {
    return (
      <motion.div
        whileHover={hover ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' } : {}}
        whileTap={onClick ? { scale: 0.98 } : {}}
        className={cn(baseStyles, (onClick || hover) && 'cursor-pointer', className)}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn(baseStyles, className)}>
      {children}
    </div>
  );
}
