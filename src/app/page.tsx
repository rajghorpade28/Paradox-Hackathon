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
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">

        {/* Hero Section - Extremely Minimal */}
        <section className="text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Threat Intelligence Engine
          </h2>
          <p className="text-[10px] uppercase tracking-[0.5em] text-emerald-500 font-bold mb-10 opacity-80">
            Autonomous Detection Infrastructure
          </p>
          <ScannerInput isScanning={isScanning} onSubmit={initiateScan} />
        </section>

        {/* Global Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left Column: Pipeline Steps (1 col) */}
          <div className="lg:col-span-1 space-y-6">
            <AgentStepper
              domainStatus={getStepperStatus("domain")}
              scrapingStatus={getStepperStatus("scraping")}
              visionStatus={getStepperStatus("vision")}
            />

            <div className="h-48">
              <RiskScoreGauge score={results?.overall_risk_score || 0} />
            </div>
          </div>

          {/* Middle Area: Detailed Insights (3 cols) */}
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

          {/* Right Column: Global Threat Feed (1 col) */}
          <div className="lg:col-span-1">
            <GlobalThreatFeed />
          </div>

        </div>

      </div>
    </LayoutShell>
  );
}
