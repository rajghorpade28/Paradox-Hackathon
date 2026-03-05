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
        <Card className="bg-slate-900 border-slate-800 h-full">
            <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-lg font-mono text-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <AlertOctagon className="w-5 h-5 text-amber-500" />
                        Threat Intelligence
                    </div>
                    <div className="flex gap-2">
                        {urgencyKeywords && (
                            <Badge className="bg-amber-500 text-black border-none text-[10px] font-bold px-2 py-0.5">
                                URGENCY
                            </Badge>
                        )}
                        {suspiciousForms && suspiciousForms > 0 ? (
                            <Badge className="bg-rose-600 text-white border-none text-[10px] font-bold px-2 py-0.5">
                                FORM DETECTED
                            </Badge>
                        ) : null}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        AI Findings
                    </h4>
                    <p className="text-slate-200 text-sm leading-relaxed p-3 bg-slate-950 rounded border border-slate-800">
                        {findings || "Awaiting scan initialization..."}
                    </p>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-3">Detected Flags</h4>
                    {redFlags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {redFlags.map((flag, idx) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-rose-500/10 text-rose-400 border-rose-500/30 px-3 py-1 text-xs font-mono"
                                >
                                    {flag}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-500 text-sm italic">
                            No flags detected or scan pending.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
