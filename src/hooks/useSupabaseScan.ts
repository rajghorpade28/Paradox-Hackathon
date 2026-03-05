import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface DomainAgentData {
    findings: string;
    red_flags: string[];
}

export interface VisionAgentData {
    visual_similarity_score: number;
    matched_brand: string;
    observations: string;
    suspicious_screenshot_url: string | null;
    target_brand_screenshot_url: string | null;
}

export interface ContentAgentData {
    red_flags: string[];
    urgency_keywords_detected: boolean;
    suspicious_forms: number;
}

export interface ScannerState {
    isScanning: boolean;
    status: "idle" | "pending" | "scraping" | "analyzing" | "completed" | "failed";
    progress: number;
    results: {
        overall_risk_score: number;
        risk_category: string;
        domain_agent_data: DomainAgentData | null;
        vision_agent_data: VisionAgentData | null;
        content_agent_data: ContentAgentData | null;
    } | null;
}

export function useSupabaseScan() {
    const [state, setState] = useState<ScannerState>({
        isScanning: false,
        status: "idle",
        progress: 0,
        results: null,
    });

    const initiateScan = useCallback(async (url: string) => {
        setState((prev) => ({
            ...prev,
            isScanning: true,
            status: "pending",
            progress: 10,
            results: null
        }));

        try {
            // Create the scan via our API
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const { scanId, error } = await response.json();

            if (error) throw new Error(error);

            // Subscribe to real-time updates for this scan
            const channel = supabase
                .channel(`scan-${scanId}`)
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'scans', filter: `id=eq.${scanId}` },
                    (payload) => {
                        const updatedDoc = payload.new;

                        let progress = 20;
                        if (updatedDoc.status === "scraping") progress = 40;
                        if (updatedDoc.status === "analyzing") progress = 70;
                        if (updatedDoc.status === "completed") progress = 100;

                        setState((prev) => ({
                            ...prev,
                            status: updatedDoc.status as any,
                            progress,
                            results: updatedDoc.status === "completed" ? {
                                overall_risk_score: updatedDoc.overall_risk_score,
                                risk_category: updatedDoc.risk_category,
                                domain_agent_data: updatedDoc.domain_agent_data,
                                vision_agent_data: updatedDoc.vision_agent_data,
                                content_agent_data: updatedDoc.content_agent_data,
                            } : prev.results,
                            isScanning: updatedDoc.status !== "completed" && updatedDoc.status !== "failed",
                        }));

                        if (updatedDoc.status === "completed") {
                            toast.success("Scan completed successfully!");
                            channel.unsubscribe();
                        }
                        if (updatedDoc.status === "failed") {
                            toast.error("Scan failed. Potential AI timeout.");
                            channel.unsubscribe();
                        }
                    }
                )
                .subscribe();

        } catch (err: any) {
            toast.error(err.message || "Failed to initiate scan");
            setState((prev) => ({ ...prev, isScanning: false, status: "failed" }));
        }
    }, []);

    return { ...state, initiateScan };
}
