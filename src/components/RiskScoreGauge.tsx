"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

interface RiskScoreGaugeProps {
    score: number;
}

export function RiskScoreGauge({ score }: RiskScoreGaugeProps) {
    const { color, category } = useMemo(() => {
        if (score < 30) return { color: "#10b981", category: "Safe" }; // emerald-500
        if (score <= 70) return { color: "#f59e0b", category: "Warning" }; // amber-500
        return { color: "#f43f5e", category: "Critical" }; // rose-500
    }, [score]);

    const data = [
        { name: "Score", value: score },
        { name: "Remaining", value: 100 - score },
    ];

    return (
        <Card className="bg-slate-900 border-slate-800 flex flex-col items-center justify-center relative h-full">
            <CardHeader className="pb-0 pt-6 w-full text-center">
                <CardTitle className="text-lg font-mono text-slate-200 flex items-center justify-center gap-2">
                    <ShieldAlert className="w-5 h-5" style={{ color }} />
                    Overall Risk Score
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col items-center justify-center flex-1 w-full">
                <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="100%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key="cell-0" fill={color} style={{ transition: "all 1s ease-in-out" }} />
                                <Cell key="cell-1" fill="#1e293b" /> {/* slate-800 */}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center pb-2">
                        <span className="text-4xl font-black text-slate-100 tabular-nums">
                            {score}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color }}>
                            {category}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
