"use client";

import React from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { ScannerInput } from "@/components/ScannerInput";
import { AgentStepper } from "@/components/AgentStepper";
import { VisualMatchCard } from "@/components/VisualMatchCard";
import { ThreatIntelligenceGrid } from "@/components/ThreatIntelligenceGrid";
import { RiskScoreGauge } from "@/components/RiskScoreGauge";
import { GlobalThreatFeed } from "@/components/GlobalThreatFeed";
import { useSupabaseScan } from "@/hooks/useSupabaseScan";

import { DashboardMetrics } from "@/components/DashboardMetrics";

export default function DashboardPage() {
  const { results, status, isScanning, initiateScan } = useSupabaseScan();

  const getStepperStatus = (step: string) => {
    if (status === "completed") return "completed";
    if (status === "failed") return "failed";

    if (step === "domain") {
      return results?.domain_agent_data ? "completed" : (status === "analyzing" ? "pending" : "waiting");
    }
    if (step === "scraping") {
      return status === "scraping" ? "pending" : (["analyzing", "completed"].includes(status) ? "completed" : "waiting");
    }
    if (step === "vision") {
      return results?.vision_agent_data ? "completed" : (status === "analyzing" ? "pending" : "waiting");
    }
    return "waiting";
  };

  const combinedRedFlags = [
    ...(results?.domain_agent_data?.red_flags || []),
    ...(results?.content_agent_data?.red_flags || [])
  ];

  return (
    <LayoutShell>
      <div className="space-y-6 animate-in fade-in duration-500">

        <DashboardMetrics />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-[#121214] border border-white/5 rounded-2xl p-6">
              <h3 className="text-zinc-300 text-sm font-bold tracking-tight mb-4">Investigate Target</h3>
              <ScannerInput isScanning={isScanning} onSubmit={initiateScan} />

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <AgentStepper
                  domainStatus={getStepperStatus("domain")}
                  scrapingStatus={getStepperStatus("scraping")}
                  visionStatus={getStepperStatus("vision")}
                />
                <div className="h-[280px]">
                  <RiskScoreGauge score={results?.overall_risk_score || 0} />
                </div>
              </div>
            </div>

            <VisualMatchCard
              suspiciousUrl={results?.vision_agent_data?.suspicious_screenshot_url || ""}
              targetUrl={results?.vision_agent_data?.target_brand_screenshot_url || ""}
              similarityScore={results?.vision_agent_data?.visual_similarity_score || 0}
              scanCompleted={status === "completed"}
              matchedBrand={results?.vision_agent_data?.matched_brand || ""}
              observations={results?.vision_agent_data?.observations || ""}
            />

            <ThreatIntelligenceGrid
              findings={results?.domain_agent_data?.findings || "Ready to analyze incoming telemetry..."}
              redFlags={combinedRedFlags}
              urgencyKeywords={results?.content_agent_data?.urgency_keywords_detected || false}
              suspiciousForms={results?.content_agent_data?.suspicious_forms || 0}
            />

          </div>

          <div className="lg:col-span-1 border border-white/5 bg-[#121214] rounded-2xl flex flex-col h-[calc(100vh-220px)] sticky top-[220px]">
            <GlobalThreatFeed />
          </div>

        </div>
      </div>
    </LayoutShell>
  );
}

