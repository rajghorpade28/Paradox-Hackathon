"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Scan, ShieldAlert } from "lucide-react";
import { Card } from "./ui/card";

interface ScannerBarProps {
    onScan: () => void;
    isScanning: boolean;
    scanComplete: boolean;
}

export function ScannerBar({
    onScan,
    isScanning,
    scanComplete,
}: ScannerBarProps) {
    const [url, setUrl] = useState("");

    return (
        <Card className="p-4 border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full flex-grow">
                    <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isScanning}
                        placeholder="Enter suspicious URL to analyze..."
                        className="pl-10 h-12 bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus-visible:ring-emerald-500 focus-visible:ring-offset-slate-950 font-mono"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && url.trim()) {
                                onScan();
                            }
                        }}
                    />
                </div>
                <Button
                    onClick={onScan}
                    disabled={isScanning || !url.trim()}
                    className="h-12 w-full md:w-auto px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:shadow-none"
                >
                    {isScanning ? (
                        <span className="flex items-center gap-2">
                            <Scan className="h-5 w-5 animate-spin" />
                            ANALYZING...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Scan className="h-5 w-5" />
                            INITIATE AI SCAN
                        </span>
                    )}
                </Button>
            </div>
        </Card>
    );
}
