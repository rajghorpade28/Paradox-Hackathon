import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface ScannerInputProps {
    isScanning: boolean;
    onSubmit: (url: string) => void;
}

export function ScannerInput({ isScanning, onSubmit }: ScannerInputProps) {
    const [url, setUrl] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim() && !isScanning) {
            onSubmit(url.trim());
        }
    };

    return (
        <div className="w-full mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-[#ff3b00]/5 blur-xl group-focus-within:bg-[#ff3b00]/10 transition-all rounded-full"></div>
                    <div className="relative h-14 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl flex items-center px-4 transition-all focus-within:border-[#ff3b00]/40">
                        <Search className="h-5 w-5 text-zinc-500 mr-3" />
                        <input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isScanning}
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-zinc-600 font-medium text-sm"
                            placeholder="Enter suspicious URL to analyze..."
                            type="url"
                            required
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isScanning || !url.trim()}
                    className="h-14 px-8 rounded-2xl bg-[#ff3b00] hover:bg-[#ff4f1a] disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center shadow-[0_0_20px_rgba(255,59,0,0.2)]"
                >
                    {isScanning ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin outline-none" />
                            Analyzing...
                        </>
                    ) : (
                        "Initiate scan"
                    )}
                </button>
            </form>
        </div>
    );
}
