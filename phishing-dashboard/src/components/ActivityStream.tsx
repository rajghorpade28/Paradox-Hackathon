"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
    Globe,
    Code2,
    ScanEye,
    Calculator,
    Loader2,
    CheckCircle2,
    CircleDashed,
} from "lucide-react";

interface ActivityStreamProps {
    isScanning: boolean;
    scanComplete: boolean;
}

const AGENTS = [
    { id: "domain", name: "Domain Intelligence Agent", icon: Globe },
    { id: "scraping", name: "Scraping & DOM Agent", icon: Code2 },
    { id: "vision", name: "Vision Analysis Agent", icon: ScanEye },
    { id: "risk", name: "Risk Scoring Agent", icon: Calculator },
];

export function ActivityStream({ isScanning, scanComplete }: ActivityStreamProps) {
    // 0 = none, 1-4 = scanning agents
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        if (isScanning) {
            setActiveStep(1); // Start first agent immediately

            // Simulate agents working sequentially over 4 seconds
            const timers = [
                setTimeout(() => setActiveStep(2), 1000),
                setTimeout(() => setActiveStep(3), 2000),
                setTimeout(() => setActiveStep(4), 3000),
                setTimeout(() => setActiveStep(5), 4000), // All done 
            ];

            return () => timers.forEach(clearTimeout);
        }

        if (!isScanning && !scanComplete) {
            setActiveStep(0);
        }
    }, [isScanning, scanComplete]);

    return (
        <Card className="h-full border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-sm font-semibold tracking-wider text-slate-300 flex items-center gap-2 uppercase">
                    <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                    Agent Activity Stream
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                    {AGENTS.map((agent, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = scanComplete || activeStep > stepNumber;
                        const isCurrent = isScanning && activeStep === stepNumber;
                        const isPending = !isScanning && !scanComplete && activeStep === 0;

                        const Icon = agent.icon;

                        return (
                            <div
                                key={agent.id}
                                className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active transition-all duration-500 ${isCurrent || isCompleted ? "opacity-100" : "opacity-40"
                                    }`}
                            >
                                {/* Timeline Icon Marker */}
                                <div
                                    className={`flex items-center justify-center size-10 rounded-full border-2 bg-slate-950 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-colors duration-500 ${isCompleted
                                            ? "border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                            : isCurrent
                                                ? "border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                : "border-slate-700 text-slate-500"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                </div>

                                {/* Content Panel */}
                                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm transition-colors duration-300">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-mono text-xs font-semibold text-slate-300">
                                            {agent.name}
                                        </span>
                                        {isCurrent && (
                                            <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                                        )}
                                        {isCompleted && (
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        )}
                                        {(isPending || (!isCurrent && !isCompleted)) && (
                                            <CircleDashed className="w-3 h-3 text-slate-600" />
                                        )}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
                                        {isCompleted
                                            ? "Analysis Complete"
                                            : isCurrent
                                                ? "Scanning Targets..."
                                                : "Awaiting Instructions"}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
