export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.03)_0%,transparent_50%)] pointer-events-none z-0" />
      {children}
    </>
  );
}
