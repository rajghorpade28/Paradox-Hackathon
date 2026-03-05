"use client";

import React from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { ScannerInput } from "@/components/ScannerInput";
import { AgentStepper } from "@/components/AgentStepper";
import { VisualMatchCard } from "@/components/VisualMatchCard";
import { ThreatIntelligenceGrid } from "@/components/ThreatIntelligenceGrid";
import { RiskScoreGauge } from "@/components/RiskScoreGauge";
import { useSupabaseScan } from "@/hooks/useSupabaseScan";

export default function DashboardPage() {
  const { results, status, isScanning, initiateScan } = useSupabaseScan();

  // Map status for the stepper
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

        {/* Top Search Area */}
        <section>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Threat Intelligence Engine</h2>
            <p className="text-slate-400">Deploy AI agents to analyze domains, scrape content, and detect visual spoofing.</p>
          </div>
          <ScannerInput isScanning={isScanning} onSubmit={initiateScan} />
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Column: Pipeline Steps */}
          <div className="lg:col-span-1 space-y-6">
            <AgentStepper
              domainStatus={getStepperStatus("domain")}
              scrapingStatus={getStepperStatus("scraping")}
              visionStatus={getStepperStatus("vision")}
            />

            <div className="h-64">
              <RiskScoreGauge score={results?.overall_risk_score || 0} />
            </div>
          </div>

          {/* Right Area: Detailed Insights */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">

            {/* Visual Comparison Card */}
            <VisualMatchCard
              suspiciousUrl={results?.vision_agent_data?.suspicious_screenshot_url || ""}
              targetUrl={results?.vision_agent_data?.target_brand_screenshot_url || ""}
              similarityScore={results?.vision_agent_data?.visual_similarity_score || 0}
              scanCompleted={status === "completed"}
              matchedBrand={results?.vision_agent_data?.matched_brand || ""}
              observations={results?.vision_agent_data?.observations || ""}
            />

            {/* Text Analysis Grid */}
            <div className="flex-1 min-h-[200px]">
              <ThreatIntelligenceGrid
                findings={results?.domain_agent_data?.findings || "Ready to analyze..."}
                redFlags={combinedRedFlags}
                urgencyKeywords={results?.content_agent_data?.urgency_keywords_detected || false}
                suspiciousForms={results?.content_agent_data?.suspicious_forms || 0}
              />
            </div>

          </div>
        </div>

      </div>
    </LayoutShell>
  );
}
