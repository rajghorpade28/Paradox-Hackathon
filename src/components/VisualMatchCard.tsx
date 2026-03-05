import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff, Zap } from "lucide-react";

interface VisualMatchCardProps {
    suspiciousUrl: string | null;
    targetUrl: string | null;
    similarityScore: number | null;
    /** True only after a completed scan — so we can distinguish "pending" from "no screenshot available" */
    scanCompleted?: boolean;
    matchedBrand?: string | null;
    observations?: string | null;
}

function ScreenshotSlot({
    url,
    label,
    scanCompleted,
}: {
    url: string | null;
    label: string;
    scanCompleted?: boolean;
}) {
    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</h4>
            <div className="aspect-video w-full rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01] flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
                {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={url}
                        alt={`${label} Screenshot`}
                        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                                parent.innerHTML = `<div class="flex flex-col items-center gap-2 text-slate-700 p-4 text-center"><svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7'/><line x1='16' y1='5' x2='22' y2='5'/><line x1='19' y1='2' x2='19' y2='8'/><circle cx='9' cy='9' r='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/></svg><p class='text-[9px] uppercase tracking-tighter'>Stream Error</p></div>`;
                            }
                        }}
                    />
                ) : scanCompleted ? (
                    <div className="flex flex-col items-center gap-2 text-slate-700 p-4 text-center">
                        <ImageOff className="w-5 h-5 opacity-30" />
                        <p className="text-[9px] uppercase tracking-widest opacity-30 font-bold">Signal Lost</p>
                    </div>
                ) : (
                    <div className="w-full h-full p-8 flex flex-col items-center justify-center gap-4">
                        <div className="w-full h-2 bg-white/[0.03] rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-emerald-500/20 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.1), transparent)' }}></div>
                        </div>
                        <Skeleton className="w-full h-full absolute inset-0 opacity-10 bg-white" />
                    </div>
                )}
            </div>
        </div>
    );
}

export function VisualMatchCard({
    suspiciousUrl,
    targetUrl,
    similarityScore,
    scanCompleted = false,
    matchedBrand,
    observations,
}: VisualMatchCardProps) {
    return (
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-mono">
                        Multimodal Analysis
                        {matchedBrand && (
                            <span className="ml-3 text-slate-600 font-normal lowercase tracking-normal">
                                // target: {matchedBrand}
                            </span>
                        )}
                    </h3>
                </div>
                {similarityScore !== null && (
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Similarity</span>
                        <div
                            className={`px-3 py-1 rounded-lg text-[11px] font-black tracking-wider ${similarityScore > 80
                                ? "bg-rose-500 text-white"
                                : similarityScore > 40
                                    ? "bg-amber-500 text-black"
                                    : "bg-emerald-500 text-black"
                                }`}
                        >
                            {similarityScore}%
                        </div>
                    </div>
                )}
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ScreenshotSlot
                        url={suspiciousUrl}
                        label="Source Telemetry"
                        scanCompleted={scanCompleted}
                    />
                    <ScreenshotSlot
                        url={targetUrl}
                        label="Reference Brand"
                        scanCompleted={scanCompleted}
                    />
                </div>

                {observations && (
                    <div className="mt-10 p-6 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3">
                            <Zap className="w-3 h-3 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mb-3">
                            Vision Agent Intel
                        </h4>
                        <p className="text-slate-200 text-xs leading-relaxed font-medium">
                            {observations}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
