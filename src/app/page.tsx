"use client";

import React from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { ScannerInput } from "@/components/ScannerInput";
import { AgentStepper } from "@/components/AgentStepper";
import { VisualMatchCard } from "@/components/VisualMatchCard";
import { ThreatIntelligenceGrid } from "@/components/ThreatIntelligenceGrid";
import { RiskScoreGauge } from "@/components/RiskScoreGauge";
import { useScannerState } from "@/hooks/useScannerState";

export default function DashboardPage() {
  const { state, startScan } = useScannerState();

  const isScanning = state.status === "pending" || state.status === "scanning";

  // Combine red flags from domain and content for the grid
  const combinedRedFlags = [...(state.domainData.redFlags || []), ...(state.contentData.redFlags || [])];

  return (
    <LayoutShell>
      <div className="space-y-6 animate-in fade-in duration-500">

        {/* Top Search Area */}
        <section>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Threat Intelligence Engine</h2>
            <p className="text-slate-400">Deploy AI agents to analyze domains, scrape content, and detect visual spoofing.</p>
          </div>
          <ScannerInput isScanning={isScanning} onSubmit={startScan} />
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Column: Pipeline Steps */}
          <div className="lg:col-span-1 space-y-6">
            <AgentStepper
              domainStatus={state.domainStatus}
              scrapingStatus={state.scrapingStatus}
              visionStatus={state.visionStatus}
            />

            {/* Small risk gauge fits nicely under the stepper */}
            <div className="h-64">
              <RiskScoreGauge score={state.riskScore} />
            </div>
          </div>

          {/* Right Area: Detailed Insights */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">

            {/* Visual Comparison Card */}
            <VisualMatchCard
              suspiciousUrl={state.visionData.fakeUrl}
              targetUrl={state.visionData.realUrl}
              similarityScore={state.visionData.similarity}
            />

            {/* Text Analysis Grid */}
            <div className="flex-1 min-h-[200px]">
              <ThreatIntelligenceGrid
                findings={state.domainData.findings}
                redFlags={combinedRedFlags}
              />
            </div>

          </div>
        </div>

      </div>
    </LayoutShell>
  );
}
