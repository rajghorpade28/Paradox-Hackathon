import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface VisualMatchCardProps {
    suspiciousUrl: string | null;
    targetUrl: string | null;
    similarityScore: number | null;
}

export function VisualMatchCard({ suspiciousUrl, targetUrl, similarityScore }: VisualMatchCardProps) {
    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-mono text-slate-200">Multimodal Vision Analysis</CardTitle>
                    {similarityScore !== null && (
                        <div className={`px-3 py-1 rounded text-sm font-bold ${similarityScore > 80 ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                                similarityScore > 40 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                    "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            }`}>
                            {similarityScore}% Match
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Suspicious Site */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-400">Suspicious Site</h4>
                        <div className="aspect-video w-full rounded-md border border-slate-700 overflow-hidden bg-slate-950 flex items-center justify-center">
                            {suspiciousUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={suspiciousUrl} alt="Suspicious Site Screenshot" className="w-full h-full object-cover" />
                            ) : (
                                <Skeleton className="w-full h-full" />
                            )}
                        </div>
                    </div>

                    {/* Target Brand */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-400">Target Brand</h4>
                        <div className="aspect-video w-full rounded-md border border-slate-700 overflow-hidden bg-slate-950 flex items-center justify-center">
                            {targetUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={targetUrl} alt="Target Brand Screenshot" className="w-full h-full object-cover" />
                            ) : (
                                <Skeleton className="w-full h-full" />
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
