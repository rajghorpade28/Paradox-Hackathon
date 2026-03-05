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
        { id: "domain", label: "Domain Analysis", status: domainStatus },
        { id: "scraping", label: "Content Scraping", status: scrapingStatus },
        { id: "vision", label: "Vision Matching", status: visionStatus },
    ];

    const renderIcon = (status: AgentStatus) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
            case "scanning":
                return <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />;
            case "failed":
                return <CheckCircle2 className="h-6 w-6 text-rose-500" />;
            default:
                return <CircleDashed className="h-6 w-6 text-slate-600" />;
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6 font-sans">
                Agent Execution Pipeline
            </h3>
            <div className="space-y-6">
                {steps.map((step, idx) => (
                    <div key={step.id} className="relative flex items-start gap-4">
                        {/* Connecting Line */}
                        {idx !== steps.length - 1 && (
                            <div
                                className={`absolute left-3 top-8 w-0.5 h-8 -translate-x-1/2 ${step.status === "completed" ? "bg-emerald-500/50" : "bg-slate-700/50"
                                    }`}
                            />
                        )}

                        <div className="relative z-10 bg-slate-900">
                            {renderIcon(step.status)}
                        </div>

                        <div className="pt-0.5 flex-1 min-w-0">
                            <p className={`text-sm font-medium ${step.status === "pending" ? "text-slate-500" : "text-slate-200"
                                }`}>
                                {step.label}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 uppercase font-mono tracking-wider">
                                {step.status}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
