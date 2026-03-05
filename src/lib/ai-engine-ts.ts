import { GoogleGenerativeAI } from "@google/generative-ai";
import { FirecrawlAppV1 } from "@mendable/firecrawl-js";
import stringSimilarity from "string-similarity";

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const firecrawl = new FirecrawlAppV1({ apiKey: FIRECRAWL_API_KEY });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const TARGET_BRANDS: Record<string, string> = {
    "paypal.com": "https://www.paypal.com",
    "chase.com": "https://www.chase.com",
    "apple.com": "https://www.apple.com",
    "microsoft.com": "https://www.microsoft.com",
    "google.com": "https://www.google.com",
    "amazon.com": "https://www.amazon.com",
    "facebook.com": "https://www.facebook.com",
    "instagram.com": "https://www.instagram.com",
    "netflix.com": "https://www.netflix.com",
    "wellsfargo.com": "https://www.wellsfargo.com",
};

export async function scrapeSite(url: string) {
    if (!FIRECRAWL_API_KEY) {
        return {
            markdown: "Login form detected. URGENT: Account suspended.",
            screenshot_url: null,
        };
    }
    try {
        const scrapeResponse = await firecrawl.scrapeUrl(url, {
            formats: ["markdown", "screenshot"]
        });
        if (scrapeResponse.success) {
            return {
                markdown: scrapeResponse.markdown || "",
                screenshot_url: scrapeResponse.screenshot || null,
            };
        }
    } catch (e) {
        console.error("Scraping error:", e);
    }
    return { markdown: "", screenshot_url: null };
}

// Helper for domain entropy calculation (suspicious if high)
function getEntropy(str: string) {
    const counts: Record<string, number> = {};
    for (const char of str) counts[char] = (counts[char] || 0) + 1;
    return Object.values(counts).reduce((acc, count) => {
        const p = count / str.length;
        return acc - p * Math.log2(p);
    }, 0);
}

export function analyzeDomain(url: string) {
    let domain = "";
    let hostname = "";
    try {
        const urlObj = new URL(url);
        hostname = urlObj.hostname;
        domain = hostname.replace("www.", "");
    } catch {
        domain = url;
        hostname = url;
    }

    let bestMatch = "";
    let bestScore = 0;

    for (const brand in TARGET_BRANDS) {
        const score = stringSimilarity.compareTwoStrings(domain, brand);
        if (score > bestScore) {
            bestScore = score;
            bestMatch = brand;
        }
    }

    const redFlags: string[] = [];
    let score = 10;
    let findings = "Generic or unidentified domain";

    // 1. Typosquatting Check
    if (bestScore === 1) {
        findings = `Official Domain Match: ${bestMatch}`;
        score = 0;
    } else if (bestScore > 0.5) {
        findings = `Typosquatting/Look-alike detected (targets ${bestMatch})`;
        redFlags.push(`Domain mimics legitimate platform: ${bestMatch}`);
        score = 80;
    }

    // 2. Entropy Check (Detects random generated domains)
    const entropy = getEntropy(domain.split('.')[0]);
    if (entropy > 4.0) {
        redFlags.push("High domain entropy detected (possible DGA/Generated)");
        score += 15;
    }

    // 3. Suspicious TLD Check
    const suspiciousTLDs = ['.xyz', '.top', '.pw', '.buzz', '.info', '.biz', '.cc'];
    if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
        redFlags.push(`Suspicious TLD extension detected: ${hostname.split('.').pop()}`);
        score += 20;
    }

    // 4. Keyword Check
    const keywords = ["login", "secure", "verify", "account", "update", "confirm", "banking", "signin", "support"];
    for (const kw of keywords) {
        if (url.toLowerCase().includes(kw)) {
            redFlags.push(`Phishing-related keyword in URL: '${kw}'`);
            score += 15;
            break;
        }
    }

    return {
        findings,
        redFlags,
        domainRiskScore: Math.min(100, score),
        targetBrand: bestMatch
    };
}

export async function analyzeVisuals(screenshotUrl: string | null, targetBrand: string | null) {
    if (!screenshotUrl || !GEMINI_API_KEY) {
        return {
            visualSimilarityScore: 0.1, // Default low if skipping
            matchedBrand: targetBrand,
            observations: "Vision analysis skipped. No screenshot provided."
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const resp = await fetch(screenshotUrl);
        const buffer = await resp.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");

        const prompt = `
            ACT AS: Senior Cybersecurity Forensic Analyst.
            TASK: Compare this website screenshot to the official ${targetBrand} website.
            ANALYSIS POINTS: Logo placement, color palette, font styles, and login form layout.
            OUTPUT: Valid JSON only.
            {"visual_similarity_score": 0.95, "observations": "Exact logo match and CSS clone detected."}
        `;
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64, mimeType: "image/png" } }
        ]);

        const text = result.response.text();
        const cleanedText = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanedText);

        return {
            visualSimilarityScore: parsed.visual_similarity_score || 0.1,
            matchedBrand: targetBrand,
            observations: parsed.observations || "Analysis complete."
        };
    } catch (e) {
        return { visualSimilarityScore: 0.1, matchedBrand: targetBrand, observations: "Vision processing error." };
    }
}

export function analyzeContent(markdown: string) {
    const redFlags: string[] = [];
    const text = markdown.toLowerCase();

    const checkMap = [
        { keys: ["ssn", "social security", "pan card"], flag: "Sensitive Identification Request (SSN/PAN)" },
        { keys: ["credit card", "cvv", "expiry", "card number"], flag: "Financial Data Harvesting Attempt" },
        { keys: ["urgent", "immediately", "suspended", "locked", "action required"], flag: "Social Engineering (Urgency Tactics)" },
        { keys: ["password", "pin", "credential", "otp"], flag: "Credential Phishing Form Detected" },
        { keys: ["bank", "transfer", "routing", "account number"], flag: "Banking/Payment Fraud Pattern" }
    ];

    for (const check of checkMap) {
        if (check.keys.some(k => text.includes(k))) {
            redFlags.push(check.flag);
        }
    }

    return {
        redFlags,
        urgencyKeywords: ["urgent", "immediately", "suspended", "action"].some(k => text.includes(k)),
        suspiciousForms: (text.includes("password") || text.includes("login")) ? 1 : 0
    };
}

export function calculateScore(domainScore: number, visionScore: number, contentFlags: string[]) {
    let base = (domainScore * 0.4) + (visionScore * 100 * 0.4);
    if (contentFlags.length >= 1) base += 15;
    if (contentFlags.length >= 3) base += 10;
    return Math.min(100, Math.max(0, Math.floor(base)));
}
