const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const datasets = [
    {
        target_url: "https://paypa1-account-security.xyz",
        status: "completed",
        overall_risk_score: 92,
        risk_category: "Critical",
        domain_agent_data: { findings: "Typosquatting detected (mimics paypal.com)", red_flags: ["Mimics legitimate platform", "Suspicious TLD .xyz", "Phishing keyword: security"] },
        vision_agent_data: { visual_similarity_score: 0.98, observations: "Exact pixel-perfect CSS clone of PayPal login.", matched_brand: "paypal.com" },
        content_agent_data: { red_flags: ["Credential Phishing Form Detected", "Social Engineering (Urgency Tactics)"], urgency_keywords_detected: true }
    },
    {
        target_url: "https://login-chase-online.support-banking.biz",
        status: "completed",
        overall_risk_score: 87,
        risk_category: "Critical",
        domain_agent_data: { findings: "Highly suspicious subdomain structure", red_flags: ["Typosquatting: chase", "Suspicious TLD .biz", "Keywords: login, online, support"] },
        vision_agent_data: { visual_similarity_score: 0.85, observations: "Matches Chase blue branding and logo placement.", matched_brand: "chase.com" },
        content_agent_data: { red_flags: ["Financial Data Harvesting Attempt", "Requests SSN/PAN"], urgency_keywords_detected: false }
    },
    {
        target_url: "https://microsoft-verify-user.top",
        status: "completed",
        overall_risk_score: 84,
        risk_category: "Critical",
        domain_agent_data: { findings: "Look-alike domain targeting Microsoft accounts", red_flags: ["Mimics microsoft.com", "Suspicious TLD .top"] },
        vision_agent_data: { visual_similarity_score: 0.92, observations: "Microsoft Office 365 login screen replica.", matched_brand: "microsoft.com" },
        content_agent_data: { red_flags: ["Credential Phishing Form Detected", "Urgency: Verification required"], urgency_keywords_detected: true }
    },
    {
        target_url: "https://amazon-rewards-claim.info",
        status: "completed",
        overall_risk_score: 78,
        risk_category: "Critical",
        domain_agent_data: { findings: "Malicious reward scam targeting Amazon users", red_flags: ["Mimics amazon.com", "High entropy in URL path"] },
        vision_agent_data: { visual_similarity_score: 0.70, observations: "Uses Amazon Prime logo and font styles.", matched_brand: "amazon.com" },
        content_agent_data: { red_flags: ["Social Engineering (Reward Scam)", "Requests Credit Card"], urgency_keywords_detected: true }
    },
    {
        target_url: "https://www.apple-id-update.cc",
        status: "completed",
        overall_risk_score: 89,
        risk_category: "Critical",
        domain_agent_data: { findings: "Sophisticated Apple ID credential thief", red_flags: ["Mimics apple.com", "Suspicious TLD .cc"] },
        vision_agent_data: { visual_similarity_score: 0.95, observations: "Perfect replica of the Apple ID two-factor prompt.", matched_brand: "apple.com" },
        content_agent_data: { red_flags: ["Credential Phishing Form Detected", "Identity Theft Attempt"], urgency_keywords_detected: false }
    }
];

async function seed() {
    console.log("🚀 Seeding Global Threat Intelligence Dataset...");
    const { data, error } = await supabase.from('scans').insert(datasets);
    if (error) {
        console.error("❌ Seeding failed:", error.message);
    } else {
        console.log("✨ Successfully seeded 5 high-quality phishing datasets for the demo WOW effect!");
    }
}

seed();
