import { useState, useCallback } from "react";
import { AgentStatus } from "@/components/AgentStepper";

export interface ScannerState {
    status: "idle" | "pending" | "scanning" | "completed";
    domainStatus: AgentStatus;
    scrapingStatus: AgentStatus;
    visionStatus: AgentStatus;
    riskScore: number;
    domainData: { findings: string | null; redFlags: string[] };
    visionData: { similarity: number | null; fakeUrl: string | null; realUrl: string | null };
    contentData: { redFlags: string[] };
}

const initialState: ScannerState = {
    status: "idle",
    domainStatus: "pending",
    scrapingStatus: "pending",
    visionStatus: "pending",
    riskScore: 0,
    domainData: { findings: null, redFlags: [] },
    visionData: { similarity: null, fakeUrl: null, realUrl: null },
    contentData: { redFlags: [] },
};

export function useScannerState() {
    const [state, setState] = useState<ScannerState>(initialState);

    const startScan = useCallback((url: string) => {
        // Reset state and start pending
        setState({
            ...initialState,
            status: "pending",
            domainStatus: "pending",
            scrapingStatus: "pending",
            visionStatus: "pending",
        });

        // t=1s: Start scanning
        setTimeout(() => {
            setState((s) => ({
                ...s,
                status: "scanning",
                domainStatus: "scanning",
                scrapingStatus: "scanning",
            }));
        }, 1000);

        // t=3s: Domain & Scraping findings
        setTimeout(() => {
            setState((s) => ({
                ...s,
                domainStatus: "completed",
                scrapingStatus: "completed",
                visionStatus: "scanning", // Start vision specifically now
                domainData: {
                    findings: "Typosquatting detected (targeting paypal.com)",
                    redFlags: ["New Reg", "Suspiciously close to paypal.com"]
                },
                // We'll increment the score slightly as an intermediate step
                riskScore: 40,
            }));
        }, 3000);

        // t=5s: Final completion
        setTimeout(() => {
            setState((s) => ({
                ...s,
                status: "completed",
                visionStatus: "completed",
                riskScore: 92, // Final score
                visionData: {
                    similarity: 95,
                    fakeUrl: "https://images.unsplash.com/photo-1542451313056-b7c8e626645f?q=80&w=800&auto=format&fit=crop", // placeholder image 
                    realUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff0f?q=80&w=800&auto=format&fit=crop" // placeholder image
                },
                contentData: {
                    redFlags: ["Hidden Form", "Requests SSN"]
                },
            }));
        }, 5000);
    }, []);

    return { state, startScan };
}
