import React from "react";

import { LayoutDashboard, FileSearch, AlertTriangle, ShieldCheck, Database, HelpCircle, Plus } from "lucide-react";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-[#ff3b00]/30 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0e0e11] flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-sm font-bold tracking-[0.15em] text-white">PHALANX • AI</h1>
          </div>

          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#ff3b00]/10 border border-[#ff3b00]/20 text-white font-medium text-sm">
              <LayoutDashboard className="w-4 h-4 text-[#ff3b00]" />
              Overview
            </a>
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-[#ff3b00] flex items-center justify-center text-white font-bold text-xs uppercase cursor-pointer">
              SYS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">System Admin</p>
              <p className="text-xs text-zinc-500 truncate">Agentic AI</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-8">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
