import React from "react";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3 w-full max-w-7xl mx-auto">
          <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
            PX
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Paradox Intelligence</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
