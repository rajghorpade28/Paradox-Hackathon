import os
import json
import base64
from urllib.parse import urlparse
from rapidfuzz import distance as fuzz_distance
import requests
import google.generativeai as genai

# ── API keys are injected from Appwrite Function env vars ─────────────────────
FIRECRAWL_API_KEY = os.environ.get("FIRECRAWL_API_KEY", "")
GEMINI_API_KEY    = os.environ.get("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

TARGET_BRANDS = {
    "paypal.com":     "https://www.paypal.com",
    "chase.com":      "https://www.chase.com",
    "apple.com":      "https://www.apple.com",
    "microsoft.com":  "https://www.microsoft.com",
    "google.com":     "https://www.google.com",
    "amazon.com":     "https://www.amazon.com",
    "facebook.com":   "https://www.facebook.com",
    "instagram.com":  "https://www.instagram.com",
    "netflix.com":    "https://www.netflix.com",
    "wellsfargo.com": "https://www.wellsfargo.com",
}

# ── MODULE 1: Firecrawl Scraper ───────────────────────────────────────────────

def scrape_site(url: str) -> dict:
    """Calls Firecrawl to scrape page markdown + screenshot."""
    if not FIRECRAWL_API_KEY:
        # Mock fallback when no key
        return {
            "markdown": "Login form detected. Enter your password and SSN to verify your account. URGENT: Account suspended.",
            "screenshot_url": None,
        }
    try:
        headers = {
            "Authorization": f"Bearer {FIRECRAWL_API_KEY}",
            "Content-Type": "application/json",
        }
        print(f"Scraping {url} via Firecrawl...")
        resp = requests.post(
            "https://api.firecrawl.dev/v1/scrape",
            json={"url": url, "formats": ["markdown", "screenshot"]},
            headers=headers,
            timeout=20, # Reduced to fit function limits
        )
        data = resp.json()
        if data.get("success"):
            inner = data.get("data", {})
            return {
                "markdown": inner.get("markdown", ""),
                "screenshot_url": inner.get("screenshot"),
            }
        return {"markdown": "", "screenshot_url": None}
    except Exception as e:
        return {"markdown": "", "screenshot_url": None}


# ── MODULE 2: Domain Analyzer (RapidFuzz) ────────────────────────────────────

def analyze_domain(url: str) -> dict:
    """Compares domain against known brands using Levenshtein distance."""
    try:
        parsed = urlparse(url)
        domain = (parsed.netloc or parsed.path).replace("www.", "").split("/")[0].split(":")[0]
    except Exception:
        domain = url

    best_match = None
    lowest_dist = float("inf")
    for brand in TARGET_BRANDS:
        dist = fuzz_distance.Levenshtein.distance(domain, brand)
        if dist < lowest_dist:
            lowest_dist = dist
            best_match = brand

    findings = "Unrelated domain — no brand match"
    red_flags = []
    score = 10

    if lowest_dist == 0:
        findings = f"Exact match: {best_match} (appears to be official domain)"
        score = 0
    elif lowest_dist <= 3:
        findings = f"Typosquatting detected — targeting {best_match} (edit distance: {lowest_dist})"
        red_flags.append(f"Domain extremely close to {best_match}")
        score = 85

    # Check for suspicious URL keywords
    for kw in ["login", "secure", "verify", "account", "update", "confirm", "banking", "signin"]:
        if kw in url.lower():
            red_flags.append(f"Suspicious keyword in URL: '{kw}'")
            score = min(100, score + 10)
            break

    return {
        "findings":       findings,
        "red_flags":      red_flags,
        "domain_risk_score": min(100, score),
        "target_brand":   best_match,
    }


# ── MODULE 3: Gemini Vision Analyzer ─────────────────────────────────────────

def analyze_visuals(screenshot_url: str | None, target_brand: str | None) -> dict:
    """Sends screenshot to Gemini 1.5 Flash for visual spoofing detection."""
    if not screenshot_url:
        return {
            "visual_similarity_score": 0.0,
            "matched_brand": target_brand,
            "suspicious_screenshot_url": None,
            "target_brand_screenshot_url": None,
            "observations": "No screenshot available from scraper.",
        }

    if not GEMINI_API_KEY:
        # Mock fallback
        return {
            "visual_similarity_score": 0.88,
            "matched_brand": target_brand,
            "suspicious_screenshot_url": screenshot_url,
            "target_brand_screenshot_url": None,
            "observations": "Mock: Visually similar layout to target brand login page.",
        }

    try:
        img_resp = requests.get(screenshot_url, timeout=20)
        image_b64 = base64.b64encode(img_resp.content).decode("utf-8")
        mime = img_resp.headers.get("Content-Type", "image/png").split(";")[0]

        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            f"You are a cybersecurity analyst detecting phishing sites. "
            f"Examine this screenshot from a potentially suspicious website. "
            f"The suspected target brand is '{target_brand}'. "
            f"Rate the VISUAL similarity to the real '{target_brand}' website on a scale 0.0 to 1.0. "
            f"Return ONLY valid JSON, no markdown: "
            f'{{\"visual_similarity_score\": 0.95, \"observations\": \"Brief reasoning\"}}'
        )
        response = model.generate_content([prompt, {"mime_type": mime, "data": image_b64}])

        text = response.text.strip()
        # Strip markdown code fences if present
        if "```" in text:
            text = text.split("```")[1]
            if text.lower().startswith("json"):
                text = text[4:]
        parsed = json.loads(text.strip())

        return {
            "visual_similarity_score": float(parsed.get("visual_similarity_score", 0.5)),
            "matched_brand": target_brand,
            "suspicious_screenshot_url": screenshot_url,
            "target_brand_screenshot_url": None,
            "observations": parsed.get("observations", ""),
        }
    except Exception as e:
        return {
            "visual_similarity_score": 0.5,
            "matched_brand": target_brand,
            "suspicious_screenshot_url": screenshot_url,
            "target_brand_screenshot_url": None,
            "observations": f"Vision analysis error: {str(e)}",
        }


# ── MODULE 4: Content Analyzer ────────────────────────────────────────────────

def analyze_content(markdown: str) -> dict:
    """Scans scraped page text for malicious patterns."""
    red_flags = []
    text = markdown.lower()

    checks = [
        (["ssn", "social security number"],             "Requests Social Security Number"),
        (["credit card", "card number", "cvv"],         "Requests credit card details"),
        (["urgent", "immediately", "suspended", "locked", "verify now", "act now"],
                                                        "High urgency language detected"),
        (["password", "passwd", "pin"],                 "Requests password credentials"),
        (["bank account", "routing number", "account number"], "Requests banking details"),
        (["mother's maiden", "security question"],      "Requests security question answers"),
    ]

    for keywords, flag in checks:
        if any(kw in text for kw in keywords):
            red_flags.append(flag)

    return {
        "red_flags": red_flags,
        "urgency_keywords_detected": any(
            kw in text for kw in ["urgent", "immediately", "suspended", "locked"]
        ),
        "suspicious_forms": 1 if "password" in text else 0,
    }


# ── MODULE 5: Scoring Engine ──────────────────────────────────────────────────

def calculate_score(domain_score: int, vision_similarity: float, content_flags: list) -> int:
    base = (domain_score * 0.4) + (vision_similarity * 100 * 0.4)
    if len(content_flags) >= 1:
        base += 15
    if len(content_flags) >= 3:
        base += 10
    return int(min(100, max(0, base)))


# ── MAIN ENTRY POINT ──────────────────────────────────────────────────────────

def run_agentic_scan(target_url: str) -> dict:
    """Orchestrates all agents. Returns structured result dict."""
    print(f"\n--- Agentic Scan: {target_url} ---")

    print(f"Step 1: Scraping content...")
    scrape_data  = scrape_site(target_url)
    
    print(f"Step 2: Analyzing domain history and reputation...")
    domain_data  = analyze_domain(target_url)
    
    print(f"Step 3: Running Multimodal Vision Analysis...")
    vision_data  = analyze_visuals(scrape_data.get("screenshot_url"), domain_data.get("target_brand"))
    
    print(f"Step 4: Scrutinizing page content for red flags...")
    content_data = analyze_content(scrape_data.get("markdown", ""))

    overall_score = calculate_score(
        domain_data["domain_risk_score"],
        vision_data["visual_similarity_score"],
        content_data["red_flags"],
    )

    category = "Safe"
    if overall_score > 70:
        category = "Critical"
    elif overall_score > 30:
        category = "Warning"

    return {
        "overall_risk_score": overall_score,
        "risk_category": category,
        # Each field is JSON-stringified (Appwrite String attribute)
        "domain_agent_data": json.dumps({
            "findings":  domain_data["findings"],
            "red_flags": domain_data["red_flags"],
        }),
        "vision_agent_data": json.dumps({
            "visual_similarity_score":    vision_data["visual_similarity_score"],
            "matched_brand":              vision_data["matched_brand"],
            "suspicious_screenshot_url":  vision_data["suspicious_screenshot_url"],
            "target_brand_screenshot_url": vision_data["target_brand_screenshot_url"],
            "observations":               vision_data.get("observations", ""),
        }),
        "content_agent_data": json.dumps({
            "red_flags":                  content_data["red_flags"],
            "urgency_keywords_detected":  content_data.get("urgency_keywords_detected", False),
            "suspicious_forms":           content_data.get("suspicious_forms", 0),
        }),
    }


if __name__ == "__main__":
    result = run_agentic_scan("https://www.paypai-secure-login.com")
    print(json.dumps(result, indent=2))
