export const MOCK_SCAN_RESULT = {
  scan_id: "req_98765xyz",
  target_url: "http://secure-chase-update.net",
  status: "completed",
  overall_risk_score: 92,
  risk_category: "Critical",
  agent_results: {
    domain_agent: {
      status: "complete",
      findings: "Typosquatting detected. Domain age is 2 days.",
      red_flags: ["New Registration", "Keyword combo-squatting"],
    },
    vision_agent: {
      status: "complete",
      visual_similarity_score: 95,
      target_brand_matched: "Chase Bank",
      suspicious_screenshot_url:
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop",
      baseline_screenshot_url:
        "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=400&h=300&fit=crop",
    },
    content_agent: {
      status: "complete",
      html_threat_score: 88,
      findings:
        "Credential harvesting form detected. Hidden tracking pixels found.",
      red_flags: ["Password input field present", "No SSL enforcement"],
    },
  },
};

export type ScanResult = typeof MOCK_SCAN_RESULT;
