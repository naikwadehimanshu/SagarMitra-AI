import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatTimestamp(ts: string): string {
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export function getRiskColor(level: string): string {
  switch(level?.toUpperCase()) {
    case 'LOW': return '#22c55e';
    case 'MODERATE': return '#f59e0b';
    case 'HIGH': return '#f97316';
    case 'EXTREME': return '#ef4444';
    default: return '#94a3b8';
  }
}

export function getRiskEmoji(level: string): string {
  switch(level?.toUpperCase()) {
    case 'LOW': return '🟢';
    case 'MODERATE': return '🟡';
    case 'HIGH': return '🟠';
    case 'EXTREME': return '🔴';
    default: return '⚪';
  }
}
