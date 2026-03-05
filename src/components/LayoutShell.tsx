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
            <h1 className="text-sm font-bold tracking-[0.15em] text-white">CY • FOCUS</h1>
          </div>

          <button className="w-full bg-[#ff3b00] hover:bg-[#ff4f1a] text-white font-medium text-sm rounded-lg flex items-center justify-between px-3 py-2.5 transition-colors mb-6 shadow-[0_0_15px_rgba(255,59,0,0.2)]">
            <span>New task</span>
            <div className="bg-white/20 p-1 rounded-md">
              <Plus className="w-4 h-4" />
            </div>
          </button>

          <nav className="space-y-1">
            <a href="#" className="flexItems-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-white font-medium text-sm">
              <LayoutDashboard className="w-4 h-4 text-zinc-400" />
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors text-sm">
              <FileSearch className="w-4 h-4" />
              Findings
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors text-sm">
              <AlertTriangle className="w-4 h-4" />
              Incidents
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors text-sm">
              <ShieldCheck className="w-4 h-4" />
              Compliance
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors text-sm">
              <Database className="w-4 h-4" />
              Vault
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 16m4.3 5L15 21l3-3m0 0l-3-3m3 3h-8" /></svg>
              Integrations
            </a>
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <a href="#" className="flex items-center gap-3 text-zinc-400 hover:text-white text-sm">
            <HelpCircle className="w-4 h-4" />
            Help & Docs
          </a>
          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-[#ff3b00] flex items-center justify-center text-white font-bold text-xs uppercase cursor-pointer">
              AG
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Anna Gunn</p>
              <p className="text-xs text-zinc-500 truncate">@gunna25</p>
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
