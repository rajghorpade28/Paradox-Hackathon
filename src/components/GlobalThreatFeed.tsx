"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, ShieldAlert, Zap, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";

interface Threat {
    id: string;
    target_url: string;
    overall_risk_score: number;
    risk_category: string;
    created_at: string;
}

export function GlobalThreatFeed() {
    const [threats, setThreats] = useState<Threat[]>([]);

    useEffect(() => {
        const fetchThreats = async () => {
            const { data } = await supabase
                .from('scans')
                .select('id, target_url, overall_risk_score, risk_category, created_at')
                .order('created_at', { ascending: false })
                .limit(10);
            if (data) setThreats(data as Threat[]);
        };

        fetchThreats();

        const channel = supabase
            .channel('db-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'scans' },
                () => fetchThreats()
            )
            .subscribe();

        return () => { channel.unsubscribe(); };
    }, []);

    return (
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-2xl p-6 overflow-hidden h-full flex flex-col">
            <div className="space-y-4 overflow-y-auto pr-2 flex-1 scrollbar-hide">
                {threats.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center gap-4">
                        <Loader2 className="w-4 h-4 text-zinc-800 animate-spin" />
                        <p className="text-zinc-700 text-[10px] uppercase tracking-tighter font-bold">Initializing Signal Feed</p>
                    </div>
                )}
                {threats.map((threat) => (
                    <div
                        key={threat.id}
                        className="p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/0 hover:border-white/5 transition-all group cursor-pointer"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] text-white font-bold truncate tracking-tight group-hover:text-[#ff4f1a] transition-colors">
                                    {new URL(threat.target_url).hostname || threat.target_url}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-1 h-1 rounded-full ${threat.overall_risk_score > 70 ? 'bg-rose-500 animate-pulse' : 'bg-[#ff3b00]'}`} />
                                    <p className="text-[9px] text-zinc-600 font-mono tracking-tighter truncate lowercase">
                                        ID: {threat.id.split('-')[0]}...
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-[12px] font-black tracking-tighter ${threat.overall_risk_score > 70 ? 'text-rose-500' : 'text-[#ff3b00]'}`}>
                                    {threat.overall_risk_score}%
                                </p>
                                <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-[0.1em]">RISK</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[9px] text-zinc-700 font-medium uppercase tracking-[0.2em] text-center">
                    Decrypting global traffic...
                </p>
            </div>
        </div>
    );
}
