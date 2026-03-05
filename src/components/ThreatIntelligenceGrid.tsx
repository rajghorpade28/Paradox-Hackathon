import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertOctagon, Info } from "lucide-react";

interface ThreatIntelligenceGridProps {
    findings: string | null;
    redFlags: string[];
    urgencyKeywords?: boolean;
    suspiciousForms?: number;
}

export function ThreatIntelligenceGrid({ findings, redFlags, urgencyKeywords, suspiciousForms }: ThreatIntelligenceGridProps) {
    return (
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-2xl h-full flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-mono">Forensic Insights</h3>
                </div>
                <div className="flex gap-2">
                    {urgencyKeywords && (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-bold px-2 h-4 flex items-center">
                            URGENCY
                        </Badge>
                    )}
                    {suspiciousForms && suspiciousForms > 0 ? (
                        <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[9px] font-bold px-2 h-4 flex items-center">
                            MALICIOUS FORM
                        </Badge>
                    ) : null}
                </div>
            </div>

            <div className="p-8 space-y-10 flex-1">
                <div>
                    <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Neural Analysis</h4>
                    <div className="text-slate-300 text-xs leading-relaxed font-medium">
                        {findings || "Infrastructure standby. Awaiting telemetry..."}
                    </div>
                </div>

                <div>
                    <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Detected Anomalies</h4>
                    {redFlags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {redFlags.map((flag, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white/[0.03] text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight flex items-center gap-2"
                                >
                                    <div className="w-1 h-1 rounded-full bg-rose-500" />
                                    {flag}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-slate-600 text-[10px] italic font-mono">
                            Systems clear. No redline flags detected.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
