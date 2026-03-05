"use client";

import { useState, useCallback, useRef } from "react";
import { ID } from "appwrite";
import { client, databases, DB_ID, COLLECTION_ID } from "@/lib/appwrite";
import { AgentStatus } from "@/components/AgentStepper";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DomainAgentData {
    findings?: string;        // direct summary string from domain agent
    red_flags?: string[];
    // legacy optional fields (kept for backwards compat)
    age_days?: number;
    registrar_reputation?: string;
    ssl_valid?: boolean;
}

export interface VisionAgentData {
    visual_similarity_score?: number;
    matched_brand?: string;
    suspicious_screenshot_url?: string | null;
    target_brand_screenshot_url?: string | null;
    observations?: string;
}

export interface ContentAgentData {
    urgency_keywords_detected?: boolean;
    suspicious_forms?: number;
    red_flags?: string[];
}

export interface ScannerState {
    status: "idle" | "pending" | "scanning" | "completed" | "failed";
    domainStatus: AgentStatus;
    scrapingStatus: AgentStatus;
    visionStatus: AgentStatus;
    riskScore: number;
    domainData: { findings: string | null; redFlags: string[] };
    visionData: {
        similarity: number | null;
        fakeUrl: string | null;
        realUrl: string | null;
        matchedBrand: string | null;
        observations: string | null;
    };
    contentData: { redFlags: string[]; urgencyKeywords: boolean; suspiciousForms: number };
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: ScannerState = {
    status: "idle",
    domainStatus: "pending",
    scrapingStatus: "pending",
    visionStatus: "pending",
    riskScore: 0,
    domainData: { findings: null, redFlags: [] },
    visionData: { similarity: null, fakeUrl: null, realUrl: null, matchedBrand: null, observations: null },
    contentData: { redFlags: [], urgencyKeywords: false, suspiciousForms: 0 },
};

// ─── Safe JSON parser ─────────────────────────────────────────────────────────

function safeParseJSON<T>(raw: unknown, fallback: T): T {
    if (!raw) return fallback;
    if (typeof raw === "object") return raw as T;
    try {
        return JSON.parse(raw as string) as T;
    } catch {
        return fallback;
    }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppwriteScan() {
    const [state, setState] = useState<ScannerState>(initialState);
    // Keep a ref to the unsubscribe function so we can always clean up
    const unsubscribeRef = useRef<(() => void) | null>(null);

    const cleanupSubscription = useCallback(() => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }
    }, []);

    const startScan = useCallback(
        async (url: string) => {
            // Clean up any previous subscription
            cleanupSubscription();

            // Reset to pending state
            setState({ ...initialState, status: "pending" });

            let docId: string;

            // 1. Create the document in Appwrite → this triggers the backend function
            try {
                const docId_generated = ID.unique();
                const randomInt = () => Math.floor(Math.random() * 2147483647); // Safe 32-bit int

                const doc = await databases.createDocument(DB_ID, COLLECTION_ID, docId_generated, {
                    target_url: url,
                    status: "pending",
                    scanId: randomInt(),     // Must be Integer
                    deviceId: randomInt(),   // Must be Integer
                    scanDate: new Date().toISOString(), // Must be DateTime (ISO 8601)
                    scanType: "digital", // Must be one of (physical, digital)
                });
                docId = doc.$id;
            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : "Failed to create scan document.";
                toast.error("Scan Failed", { description: message });
                setState(initialState);
                return;
            }

            // 2. Subscribe to Realtime updates on this specific document
            const channel = `databases.${DB_ID}.collections.${COLLECTION_ID}.documents.${docId}`;

            const unsubscribe = client.subscribe(channel, (response) => {
                // The payload is the updated document
                const doc = response.payload as Record<string, unknown>;
                const backendStatus = doc.status as string;

                if (backendStatus === "scanning") {
                    // Backend has started — advance all agents to scanning
                    setState((s) => ({
                        ...s,
                        status: "scanning",
                        domainStatus: "scanning",
                        scrapingStatus: "scanning",
                        visionStatus: "scanning",
                    }));
                    return;
                }

                if (backendStatus === "completed") {
                    // Parse stringified JSON agent payloads safely
                    const domainRaw = safeParseJSON<DomainAgentData>(
                        doc.domain_agent_data,
                        {}
                    );
                    const visionRaw = safeParseJSON<VisionAgentData>(
                        doc.vision_agent_data,
                        {}
                    );
                    const contentRaw = safeParseJSON<ContentAgentData>(
                        doc.content_agent_data,
                        {}
                    );

                    const riskScore =
                        typeof doc.overall_risk_score === "number"
                            ? doc.overall_risk_score
                            : 0;

                    // Use the findings string directly from the domain agent
                    const domainFindings = domainRaw.findings ?? null;

                    // Merge red flags from domain + content agents
                    const domainRedFlags = domainRaw.red_flags ?? [];
                    const contentRedFlags = contentRaw.red_flags ?? [];

                    // Vision similarity as integer percentage
                    const similarity =
                        typeof visionRaw.visual_similarity_score === "number"
                            ? Math.round(visionRaw.visual_similarity_score * 100)
                            : null;

                    setState({
                        status: "completed",
                        domainStatus: "completed",
                        scrapingStatus: "completed",
                        visionStatus: "completed",
                        riskScore,
                        domainData: {
                            findings: domainFindings,
                            redFlags: domainRedFlags,
                        },
                        visionData: {
                            similarity,
                            fakeUrl: visionRaw.suspicious_screenshot_url ?? null,
                            realUrl: visionRaw.target_brand_screenshot_url ?? null,
                            matchedBrand: visionRaw.matched_brand ?? null,
                            observations: visionRaw.observations ?? null,
                        },
                        contentData: {
                            redFlags: contentRedFlags,
                            urgencyKeywords: contentRaw.urgency_keywords_detected ?? false,
                            suspiciousForms: contentRaw.suspicious_forms ?? 0,
                        },
                    });

                    // Unsubscribe once we have our final result
                    cleanupSubscription();
                    return;
                }

                if (backendStatus === "failed") {
                    toast.error("Scan Error", {
                        description:
                            "The backend agent encountered an error. Please try again.",
                    });
                    setState((s) => ({
                        ...s,
                        status: "failed",
                        domainStatus: "error",
                        scrapingStatus: "error",
                        visionStatus: "error",
                    }));
                    cleanupSubscription();
                }
            });

            unsubscribeRef.current = unsubscribe;
        },
        [cleanupSubscription]
    );

    return { state, startScan };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDomainFindings(data: DomainAgentData): string | null {
    const parts: string[] = [];
    if (data.age_days !== undefined)
        parts.push(`Domain age: ${data.age_days} day(s)`);
    if (data.registrar_reputation)
        parts.push(`Registrar reputation: ${data.registrar_reputation}`);
    if (data.ssl_valid !== undefined)
        parts.push(`SSL: ${data.ssl_valid ? "Valid" : "Invalid / Self-signed"}`);
    return parts.length > 0 ? parts.join(" · ") : null;
}
