import os
import json
import time
from urllib.parse import urlparse
from rapidfuzz import distance
import requests # assuming using standard request for Firecrawl API if no sdk
import google.generativeai as genai

# Configure APIs (set these in your environment)
FIRECRAWL_API_KEY = os.environ.get("FIRECRAWL_API_KEY", "dummy_firecrawl")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "dummy_gemini")

if GEMINI_API_KEY != "dummy_gemini":
    genai.configure(api_key=GEMINI_API_KEY)

TARGET_BRANDS = ["chase.com", "paypal.com", "apple.com", "microsoft.com", "google.com"]

# --- MODULE 1: The Scraper (Firecrawl) ---
def scrape_target_site(url: str) -> dict:
    """
    Calls Firecrawl API to scrape HTML/Markdown and capture a screenshot.
    Returns markdown content and screenshot URL.
    """
    print(f"[*] Scraping {url} via Firecrawl...")
    # Mock behavior for testing without real API key tonight
    if FIRECRAWL_API_KEY == "dummy_firecrawl":
        time.sleep(1) # simulate network call
        return {
            "markdown": "## Welcome to PaypaI\nPlease login to secure your account. Enter your SSN.",
            "screenshot_url": "https://example.com/mock_screenshot.png"
        }
    
    # Real implementation placeholder
    # headers = {"Authorization": f"Bearer {FIRECRAWL_API_KEY}"}
    # response = requests.post("https://api.firecrawl.dev/v1/scrape", json={"url": url, "formats": ["markdown", "screenshot"]}, headers=headers)
    # data = response.json()
    # return {"markdown": data.get("markdown"), "screenshot_url": data.get("screenshot")}
    pass

# --- MODULE 2: The Domain Module (RapidFuzz) ---
def analyze_domain(url: str) -> dict:
    """
    Strips domain and compares against target brands using Levenshtein distance.
    """
    print(f"[*] Analyzing domain for {url}...")
    try:
        parsed_uri = urlparse(url)
        domain = parsed_uri.netloc or parsed_uri.path # fallback if no scheme
        domain = domain.replace("www.", "")
    except Exception:
        domain = url

    best_match = None
    lowest_distance = float('inf')
    
    for brand in TARGET_BRANDS:
        dist = distance.Levenshtein.distance(domain, brand)
        if dist < lowest_distance:
            lowest_distance = dist
            best_match = brand

    findings = "Normal Domain"
    red_flags = []
    score = 0 # 0 means safe, higher means riskier
    
    if lowest_distance == 0:
        findings = "Exact Brand Match (Safe if official server)"
    elif lowest_distance <= 2: # Typosquatting threshold
        findings = f"Typosquatting detected (targeting {best_match})"
        red_flags.append(f"Suspiciously close to {best_match}")
        score = 90
    else:
        findings = "Unrelated Domain"
        score = 10

    if "login" in url or "secure" in url or "verify" in url:
        red_flags.append("Suspicious Keywords in URL")
        score += 20
        
    return {
        "findings": findings,
        "red_flags": red_flags,
        "domain_risk_score": min(100, score),
        "target_brand": best_match
    }

# --- MODULE 3: Multimodal Vision Module (LLM) ---
def analyze_visuals(screenshot_url: str, target_brand: str) -> dict:
    """
    Passes screenshot to multimodal LLM to detect spoofing.
    """
    print(f"[*] Analyzing visuals from {screenshot_url} for target brand '{target_brand}'...")
    if GEMINI_API_KEY == "dummy_gemini" or screenshot_url == "https://example.com/mock_screenshot.png":
        time.sleep(1)
        # Mocking finding spoofed logo
        return {
            "similarity_score": 95,
            "observations": "Highly similar UI to PayPal login. Logo is spoofed.",
            "fake_url": screenshot_url,
            "real_url": f"https://www.{target_brand}" if target_brand else "Unknown"
        }
        
    # Real implementation:
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        prompt = f"Act as a fraud analyst. The user provided this screenshot from a potentially suspicious site targeting '{target_brand}'. Determine the visual similarity to the real brand (0-100). Return ONLY JSON format: {{\"similarity_score\": 95, \"observations\": \"reasoning\"}}"
        # Note: You would need to download the image or use the URL with Gemini depending on the exact API support.
        # For this hackathon stub, we simulate a response:
        response = model.generate_content([prompt, screenshot_url]) # Assuming Gemini can take URLs or you fetch it first
        # parse JSON response from LLM...
        return {"similarity_score": 90, "observations": "Looks spoofed", "fake_url": screenshot_url, "real_url": f"https://www.{target_brand}"}
    except Exception as e:
        print(f"LLM Error: {e}")
        return {"similarity_score": 0, "observations": str(e), "fake_url": screenshot_url, "real_url": ""}

# --- MODULE 4: Content Module (Bonus/Text Analysis) ---
def analyze_content(markdown: str) -> dict:
    red_flags = []
    if "SSN" in markdown or "Social Security" in markdown:
        red_flags.append("Requests SSN")
    if "urgent" in markdown.lower() or "suspend" in markdown.lower():
        red_flags.append("Urgent Call to Action")
    return {"red_flags": red_flags}

# --- MODULE 5: The Scoring Engine ---
def calculate_overall_score(domain_score: int, vision_similarity: int, has_content_flags: bool) -> int:
    """
    Weights the different factors. 
    If domain is typosquatted AND vision is highly similar -> CRITICAL.
    """
    base_score = (domain_score * 0.4) + (vision_similarity * 0.4)
    if has_content_flags:
        base_score += 20
        
    return int(min(100, max(0, base_score)))

# --- FINAL EXECUTION CONTRACT ---
def run_agentic_scan(target_url: str) -> dict:
    """
    Main entry point for Developer 1 to call.
    """
    print(f"\n--- Starting Agentic Scan for: {target_url} ---")
    
    # 1. Scrape
    scrape_data = scrape_target_site(target_url)
    
    # 2. Domain Analysis
    domain_data = analyze_domain(target_url)
    
    # 3. Vision Analysis
    vision_data = analyze_visuals(scrape_data["screenshot_url"], domain_data.get("target_brand"))
    
    # 4. Content Analysis
    content_data = analyze_content(scrape_data["markdown"])
    
    # 5. Score
    has_flags = len(content_data["red_flags"]) > 0
    overall_score = calculate_overall_score(
        domain_data["domain_risk_score"], 
        vision_data["similarity_score"], 
        has_flags
    )
    
    category = "Safe"
    if overall_score > 70:
        category = "Critical"
    elif overall_score > 30:
        category = "Warning"
        
    # Format output precisely as requested
    result = {
        "overall_risk_score": overall_score,
        "risk_category": category,
        "domain_agent_data": json.dumps({
            "findings": domain_data["findings"],
            "red_flags": domain_data["red_flags"]
        }),
        "vision_agent_data": json.dumps({
            "similarity": vision_data["similarity_score"],
            "fake_url": vision_data["fake_url"],
            "real_url": vision_data["real_url"]
        }),
        "content_agent_data": json.dumps({
            "red_flags": content_data["red_flags"]
        })
    }
    
    print("\n--- Scan Complete ---")
    return result

if __name__ == "__main__":
    # Test with hardcoded URLs
    test_urls = [
        "https://www.paypai.com/login-secure",
        "https://www.apple.com", # safe
        "http://chase-security-verify-account.com"
    ]
    
    for url in test_urls:
        res = run_agentic_scan(url)
        print(json.dumps(res, indent=4))
