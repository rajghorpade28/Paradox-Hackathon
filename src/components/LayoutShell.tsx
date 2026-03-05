import React from "react";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2394a3b8' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")` }}>
      </div>
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent"></div>

      {/* Top Navigation */}
      <header className="h-20 border-b border-white/5 bg-slate-950/50 backdrop-blur-md flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 p-[1px]">
              <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center text-emerald-400 font-black text-xs">
                PX
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none mb-1">Paradox Intelligence</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-medium">Detection Engine</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
