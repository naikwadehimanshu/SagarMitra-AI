'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, ShieldAlert, Navigation, Hexagon, Database, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Map, label: 'Marine Intelligence', href: '/dashboard/intelligence' },
  { icon: ShieldAlert, label: 'Safety Center', href: '/dashboard/safety' },
  { icon: Navigation, label: 'Route Planner', href: '/dashboard/routes' },
  { icon: Hexagon, label: 'Geofence Monitor', href: '/dashboard/geofence' },
  { icon: Database, label: 'Data Explorer', href: '/dashboard/data' },
  { icon: MessageSquare, label: 'Conversations', href: '/dashboard/chat' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-16 md:w-64 h-full glass border-r border-white/10 flex flex-col py-6">
      <nav className="flex-1 flex flex-col gap-2 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl transition-colors',
                  isActive 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                )}
              >
                <Icon size={20} className={cn(isActive && "drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]")} />
                <span className="hidden md:block font-medium text-sm">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
      
      <div className="px-6 py-4 mt-auto hidden md:block">
        <div className="bg-marine/50 p-4 rounded-xl border border-white/5 text-xs text-slate-400">
          <p>SagarMitra AI Core</p>
          <p className="mt-1">v1.0.0-beta</p>
        </div>
      </div>
    </aside>
  );
}
