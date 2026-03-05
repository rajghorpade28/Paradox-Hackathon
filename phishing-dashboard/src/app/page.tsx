"use client";

import { useState } from "react";
import { ScannerBar } from "@/components/ScannerBar";
import { ActivityStream } from "@/components/ActivityStream";
import { EvidenceBoard } from "@/components/evidence/EvidenceBoard";
import { MOCK_SCAN_RESULT, ScanResult } from "@/lib/mock-data";

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const handleScan = () => {
    // Reset state
    setIsScanning(true);
    setScanComplete(false);
    setScanResult(null);

    // Simulate 4-second AI API call
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      setScanResult(MOCK_SCAN_RESULT);
    }, 4000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-8 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              PhishGuard Ai
            </h1>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">
            Intelligent Phishing detection powered by AI Agents
          </p>
        </header>

        <ScannerBar
          onScan={handleScan}
          isScanning={isScanning}
          scanComplete={scanComplete}
        />

        {(isScanning || scanComplete) && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-4">
            <div className="lg:col-span-1">
              <ActivityStream
                isScanning={isScanning}
                scanComplete={scanComplete}
              />
            </div>
            <div className="lg:col-span-3">
              {scanResult && <EvidenceBoard result={scanResult} />}
              {isScanning && (
                <div className="h-full min-h-[500px] rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                    <div className="size-16 border-2 border-slate-800 rounded-full"></div>
                  </div>
                  <p className="text-emerald-400 animate-pulse text-sm">
                    Agents are orchestrating intelligence gathering...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
