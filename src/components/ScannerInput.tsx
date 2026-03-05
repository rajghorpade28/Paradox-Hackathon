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
        <div className="w-full max-w-3xl mx-auto mb-8">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isScanning}
                        className="pl-10 h-12 bg-slate-900 border-slate-700 text-slate-200 focus-visible:ring-emerald-500"
                        placeholder="Enter URL to scan (e.g., https://paypal-login-secure.com)"
                        type="url"
                        required
                    />
                </div>
                <Button
                    type="submit"
                    disabled={isScanning || !url.trim()}
                    className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                    {isScanning ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Scanning...
                        </>
                    ) : (
                        "Initiate AI Scan"
                    )}
                </Button>
            </form>
        </div>
    );
}
