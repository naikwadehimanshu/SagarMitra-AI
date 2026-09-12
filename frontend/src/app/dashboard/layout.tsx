import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MapProvider } from '@/components/maps/MapProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MapProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-navy">
        {/* Background pattern */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.03)_0%,transparent_50%)] pointer-events-none z-0" />
        
        <Header />
        
        <div className="flex-1 flex mt-16 overflow-hidden relative z-10">
          <Sidebar />
          <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </MapProvider>
  );
}
