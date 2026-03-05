"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface RiskGaugeProps {
    score: number;
}

export function RiskGauge({ score }: RiskGaugeProps) {
    // We use a half-doughnut (180deg) layout
    const data = [
        { name: "Score", value: score },
        { name: "Remaining", value: 100 - score },
    ];

    const getColor = (value: number) => {
        if (value < 40) return "#10b981"; // Emerald
        if (value < 75) return "#f59e0b"; // Amber
        return "#ef4444"; // Red
    };

    const color = getColor(score);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="150%"  /* Adjusted from 85% to prevent overlap */
                        startAngle={180}
                        endAngle={0}
                        innerRadius="70%"
                        outerRadius="95%"
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                    >
                        <Cell key="cell-score" fill={color} />
                        {/* The remaining part (unfilled background) */}
                        <Cell key="cell-remaining" fill="#1e293b" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            {/* Centered text inside gauge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span
                    className="text-5xl font-bold font-mono tracking-tighter"
                    style={{ color }}
                >
                    {score}
                    <span className="text-2xl text-slate-500">%</span>
                </span>

                <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold mt-1">
                    Threat Level
                </span>
            </div>
        </div>
    );
}