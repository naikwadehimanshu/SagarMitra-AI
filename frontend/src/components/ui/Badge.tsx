import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({ text, variant = 'neutral', size = 'md', className, icon }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    neutral: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {text}
    </span>
  );
}
