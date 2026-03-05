import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff } from "lucide-react";

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
        <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-400">{label}</h4>
            <div className="aspect-video w-full rounded-md border border-slate-700 overflow-hidden bg-slate-950 flex items-center justify-center">
                {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={url}
                        alt={`${label} Screenshot`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // If the image fails to load, show fallback
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                                parent.innerHTML = `<div class="flex flex-col items-center gap-2 text-slate-500 p-4 text-center"><svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><rect width='18' height='18' x='3' y='3' rx='2' ry='2'/><circle cx='9' cy='9' r='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/></svg><p class='text-xs'>Screenshot failed to load</p></div>`;
                            }
                        }}
                    />
                ) : scanCompleted ? (
                    // Scan finished but no URL from backend
                    <div className="flex flex-col items-center gap-2 text-slate-500 p-4 text-center">
                        <ImageOff className="w-6 h-6" />
                        <p className="text-xs">Screenshot unavailable</p>
                    </div>
                ) : (
                    <Skeleton className="w-full h-full" />
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
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-mono text-slate-200">
                        Multimodal Vision Analysis
                        {matchedBrand && (
                            <span className="ml-2 text-sm font-normal text-amber-400">
                                — targeting {matchedBrand}
                            </span>
                        )}
                    </CardTitle>
                    {similarityScore !== null && (
                        <div
                            className={`px-3 py-1 rounded text-sm font-bold ${similarityScore > 80
                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                : similarityScore > 40
                                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                }`}
                        >
                            {similarityScore}% Match
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ScreenshotSlot
                        url={suspiciousUrl}
                        label="Suspicious Site"
                        scanCompleted={scanCompleted}
                    />
                    <ScreenshotSlot
                        url={targetUrl}
                        label="Target Brand"
                        scanCompleted={scanCompleted}
                    />
                </div>

                {observations && (
                    <div className="mt-6 p-4 bg-slate-950 rounded border border-slate-800">
                        <h4 className="text-sm font-medium text-slate-400 mb-2 font-sans uppercase tracking-tight">
                            Vision Agent Observations
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed italic">
                            &ldquo;{observations}&rdquo;
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
