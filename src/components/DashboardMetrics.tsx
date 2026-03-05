"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TrendingUp, AlertCircle, ShieldAlert, Clock } from "lucide-react";

export function DashboardMetrics() {
    const [metrics, setMetrics] = useState({
        totalScans: 0,
        criticalThreats: 0,
        avgScore: 0,
        recentScans: 0
    });

    useEffect(() => {
        async function fetchMetrics() {
            // Fetch all to compute real metrics instantly (not ideal for huge datasets, but works for our hackathon demo)
            const { data, error } = await supabase
                .from('scans')
                .select('overall_risk_score, created_at');

            if (!error && data) {
                const total = data.length;
                const critical = data.filter((d: { overall_risk_score: number; created_at: string }) => d.overall_risk_score > 80).length;
                const avg = total > 0 ? Math.round(data.reduce((acc: number, curr: { overall_risk_score: number; created_at: string }) => acc + curr.overall_risk_score, 0) / total) : 0;

                // Count scans in the last 24 hours
                const oneDayAgo = new Date();
                oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                const recent = data.filter((d: { overall_risk_score: number; created_at: string }) => new Date(d.created_at) > oneDayAgo).length;

                setMetrics({ totalScans: total, criticalThreats: critical, avgScore: avg, recentScans: recent });
            }
        }

        fetchMetrics();

        // Subscribe to changes for live updates
        const channel = supabase
            .channel('metrics-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scans' }, () => {
                fetchMetrics();
            })
            .subscribe();

        return () => { channel.unsubscribe(); };
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Metric 1 */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-zinc-400 text-sm font-medium">Total analyzed</p>
                    <div className="bg-white/5 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-[#ff3b00]" /> +{metrics.recentScans}
                    </div>
                </div>
                <div className="flex items-end justify-between">
                    <h2 className="text-3xl font-light text-white">{metrics.totalScans}</h2>
                    <div className="w-16 h-8 flex items-end justify-between gap-0.5">
                        <div className="w-1/5 bg-zinc-700 h-[30%]"></div>
                        <div className="w-1/5 bg-zinc-700 h-[50%]"></div>
                        <div className="w-1/5 bg-[#ff3b00] h-[80%]"></div>
                        <div className="w-1/5 bg-[#ff3b00] h-[60%]"></div>
                        <div className="w-1/5 bg-[#ff3b00] h-[100%] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    </div>
                </div>
                <p className="text-zinc-600 text-[10px] mt-2 font-mono">{metrics.recentScans} last week</p>
            </div>

            {/* Metric 2 */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-zinc-400 text-sm font-medium">Active threats</p>
                    <div className="bg-white/5 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-[#ff3b00]" /> High risk
                    </div>
                </div>
                <div className="flex items-end justify-between">
                    <h2 className="text-3xl font-light text-white">{metrics.criticalThreats}</h2>
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <svg className="w-10 h-10 transform -rotate-90">
                            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/5" />
                            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray="100" strokeDashoffset={100 - (metrics.totalScans ? (metrics.criticalThreats / metrics.totalScans) * 100 : 0)} className="text-[#ff3b00] drop-shadow-[0_0_5px_rgba(255,59,0,0.5)]" />
                        </svg>
                        <span className="absolute text-[9px] font-bold text-white">
                            {metrics.totalScans ? Math.round((metrics.criticalThreats / metrics.totalScans) * 100) : 0}%
                        </span>
                    </div>
                </div>
                <p className="text-zinc-600 text-[10px] mt-2 font-mono">Requiring attention</p>
            </div>

            {/* Metric 3 */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-zinc-400 text-sm font-medium">Avg risk score</p>
                    <div className="bg-white/5 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-500" /> Global
                    </div>
                </div>
                <div className="flex items-end justify-between">
                    <h2 className="text-3xl font-light text-white">{metrics.avgScore}%</h2>
                    <div className="relative w-12 h-6 overflow-hidden">
                        <div className="absolute bottom-0 w-12 h-12 rounded-full border-4 border-white/5"></div>
                        <div className="absolute bottom-0 w-12 h-12 rounded-full border-4 border-[#ff3b00]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: `rotate(${metrics.avgScore * 1.8}deg)` }}></div>
                    </div>
                </div>
                <p className="text-zinc-600 text-[10px] mt-2 font-mono">System-wide average</p>
            </div>

            {/* Metric 4 */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-zinc-400 text-sm font-medium">System uptime</p>
                    <div className="bg-white/5 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" /> 99.9%
                    </div>
                </div>
                <div className="flex items-end justify-between">
                    <h2 className="text-3xl font-light text-white">2d:6h</h2>
                    <div className="w-16 h-6 flex items-center gap-0.5 justify-end">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className={`w-1 rounded-full ${i % 3 === 0 ? 'bg-[#ff3b00] h-6' : i % 2 === 0 ? 'bg-amber-500 h-4' : 'bg-emerald-500 h-2'}`}></div>
                        ))}
                    </div>
                </div>
                <p className="text-zinc-600 text-[10px] mt-2 font-mono">Since last telemetry drop</p>
            </div>
        </div>
    );
}
