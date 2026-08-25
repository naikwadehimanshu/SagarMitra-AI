import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '20px', rounded = 'rounded-md', className }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, direction: 'alternate' }}
      style={{ width, height }}
      className={cn("bg-white/10", rounded, className)}
    />
  );
}
