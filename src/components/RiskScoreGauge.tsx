"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ShieldAlert } from "lucide-react";

interface RiskScoreGaugeProps {
    score: number;
}

export function RiskScoreGauge({ score }: RiskScoreGaugeProps) {
    const { color, category } = useMemo(() => {
        if (score < 30) return { color: "#10b981", category: "Safe" }; // emerald
        if (score <= 70) return { color: "#ff3b00", category: "Warning" }; // CY FOCUS orange
        return { color: "#e11d48", category: "Critical" }; // red
    }, [score]);

    const data = [
        { name: "Score", value: score },
        { name: "Remaining", value: 100 - score },
    ];

    return (
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-2xl flex flex-col items-center justify-center relative p-6 h-full shadow-2xl">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-mono mb-6 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" style={{ color }} />
                Overall Risk Score
            </h3>

            <div className="pt-2 flex flex-col items-center justify-center flex-1 w-full">
                <div className="h-32 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="100%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={70}
                                outerRadius={85}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key="cell-0" fill={color} style={{ transition: "all 1s ease-in-out", filter: `drop-shadow(0 0 8px ${color}80)` }} />
                                <Cell key="cell-1" fill="#27272a" /> {/* zinc-800 */}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <span className="text-4xl font-light text-white tabular-nums">
                            {score}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 pb-2" style={{ color }}>
                            {category}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
