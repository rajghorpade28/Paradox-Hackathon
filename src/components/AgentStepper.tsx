import React from "react";
import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";

export type AgentStatus = "pending" | "scanning" | "completed" | "failed" | "waiting";

interface AgentStepperProps {
    domainStatus: AgentStatus;
    scrapingStatus: AgentStatus;
    visionStatus: AgentStatus;
}

export function AgentStepper({ domainStatus, scrapingStatus, visionStatus }: AgentStepperProps) {
    const steps = [
        { id: "domain", label: "Logic Gate: Domain", status: domainStatus },
        { id: "scraping", label: "Logic Gate: Content", status: scrapingStatus },
        { id: "vision", label: "Logic Gate: Multimodal", status: visionStatus },
    ];

    const renderIcon = (status: AgentStatus) => {
        switch (status) {
            case "completed":
                return <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />;
            case "scanning":
                return <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />;
            case "failed":
                return <div className="h-2 w-2 rounded-full bg-rose-500" />;
            default:
                return <div className="h-2 w-2 rounded-full bg-slate-800" />;
        }
    };

    return (
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-2xl p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-8 font-mono flex items-center gap-2">
                <div className="w-1 h-1 bg-emerald-500"></div>
                Agent Pipeline
            </h3>
            <div className="space-y-10">
                {steps.map((step, idx) => (
                    <div key={step.id} className="relative flex items-center gap-6">
                        {/* Connecting Line */}
                        {idx !== steps.length - 1 && (
                            <div
                                className={`absolute left-[3px] top-4 w-[1px] h-10 ${step.status === "completed" ? "bg-emerald-500/30" : "bg-slate-800"}`}
                            />
                        )}

                        <div className="relative z-10">
                            {renderIcon(step.status)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className={`text-[11px] font-bold uppercase tracking-wider ${step.status === "pending" ? "text-slate-500" : "text-slate-300"}`}>
                                {step.label}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest italic">
                                    {step.status}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
