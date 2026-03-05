"use client";

import { ScanResult } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { AlertTriangle, Fingerprint, Shield, Target } from "lucide-react";
import Image from "next/image";
import { RiskGauge } from "./RiskGauge";

export function EvidenceBoard({ result }: { result: ScanResult }) {
    const getRiskColor = (score: number) => {
        if (score < 40) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
        if (score < 75) return "text-amber-500 border-amber-500/20 bg-amber-500/10";
        return "text-red-500 border-red-500/20 bg-red-500/10";
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Risk Score Widget */}
                <Card className="col-span-1 border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            Final Risk Assessment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-6 h-48">
                        <RiskGauge score={result.overall_risk_score} />
                        <Badge className={`mt-4 w-full justify-center px-4 py-1.5 uppercase tracking-widest ${getRiskColor(result.overall_risk_score)}`}>
                            {result.risk_category} MATCH
                        </Badge>
                    </CardContent>
                </Card>

                {/* Visual Match Widget */}
                <Card className="col-span-2 border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-400" />
                            Vision Analysis Comparison ({result.agent_results.vision_agent.visual_similarity_score}% Similar to {result.agent_results.vision_agent.target_brand_matched})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-2 h-48 divide-x divide-slate-800">
                            <div className="relative group overflow-hidden bg-slate-950">
                                <div className="absolute inset-0 z-10 ring-inset ring-2 ring-red-500/20" />
                                <div className="absolute top-2 left-2 z-20">
                                    <Badge variant="destructive" className="bg-red-500/80 text-[10px] backdrop-blur font-mono">Suspicious DOM</Badge>
                                </div>
                                {/* Using standard img tags since images are external unsplash links */}
                                <img
                                    src={result.agent_results.vision_agent.suspicious_screenshot_url}
                                    alt="Suspicious Site"
                                    className="object-cover w-full h-full opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500"
                                />
                            </div>
                            <div className="relative group overflow-hidden bg-slate-950">
                                <div className="absolute top-2 left-2 z-20">
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] backdrop-blur font-mono">Baseline (Real)</Badge>
                                </div>
                                <img
                                    src={result.agent_results.vision_agent.baseline_screenshot_url}
                                    alt="Baseline Site"
                                    className="object-cover w-full h-full opacity-80 transition-all duration-500"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Threat Intelligence Text findings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-800 bg-slate-900/30">
                    <CardHeader className="pb-3 border-b border-slate-800/50">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Fingerprint className="w-4 h-4" /> Domain Intelligence
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <p className="text-sm text-slate-300 font-mono leading-relaxed">
                            {result.agent_results.domain_agent.findings}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {result.agent_results.domain_agent.red_flags.map((flag, idx) => (
                                <Badge key={idx} variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 font-mono text-[10px]">
                                    [{flag}]
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/30">
                    <CardHeader className="pb-3 border-b border-slate-800/50">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> HTML Content Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <p className="text-sm text-slate-300 font-mono leading-relaxed">
                            {result.agent_results.content_agent.findings}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {result.agent_results.content_agent.red_flags.map((flag, idx) => (
                                <Badge key={idx} variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 font-mono text-[10px]">
                                    [{flag}]
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
