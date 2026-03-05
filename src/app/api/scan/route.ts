import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
    scrapeSite,
    analyzeDomain,
    analyzeVisuals,
    analyzeContent,
    calculateScore
} from '@/lib/ai-engine-ts';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // 1. Create entry in Supabase
        const { data: scan, error: insertError } = await supabase
            .from('scans')
            .insert([{
                target_url: url,
                status: 'scraping'
            }])
            .select()
            .single();

        if (insertError || !scan) {
            throw new Error(`Failed to create scan record: ${insertError?.message}`);
        }

        const scanId = scan.id;

        // Perform analysis asynchronously (don't await since we use Realtime)
        // Note: For a real app, use a background worker. For hackathon, we'll keep the connection open or use edge functions.
        (async () => {
            try {
                // Step 1: Scrape
                const scrapeData = await scrapeSite(url);

                await supabase.from('scans').update({ status: 'analyzing' }).eq('id', scanId);

                // Step 2: Domain Analysis
                const domainData = analyzeDomain(url);

                // Step 3: Vision Analysis
                const visionData = await analyzeVisuals(scrapeData.screenshot_url, domainData.targetBrand);

                // Step 4: Content Analysis
                const contentData = analyzeContent(scrapeData.markdown);

                // Step 5: Scoring
                const overallScore = calculateScore(
                    domainData.domainRiskScore,
                    visionData.visualSimilarityScore,
                    contentData.redFlags
                );

                const category = overallScore > 70 ? 'Critical' : overallScore > 30 ? 'Warning' : 'Safe';

                // Final Update
                await supabase.from('scans').update({
                    status: 'completed',
                    overall_risk_score: overallScore,
                    risk_category: category,
                    domain_agent_data: {
                        findings: domainData.findings,
                        red_flags: domainData.redFlags
                    },
                    vision_agent_data: {
                        visual_similarity_score: visionData.visualSimilarityScore,
                        matched_brand: visionData.matchedBrand,
                        observations: visionData.observations,
                        suspicious_screenshot_url: scrapeData.screenshot_url
                    },
                    content_agent_data: {
                        red_flags: contentData.redFlags,
                        urgency_keywords_detected: contentData.urgencyKeywords,
                        suspicious_forms: contentData.suspiciousForms
                    }
                }).eq('id', scanId);

            } catch (err: any) {
                console.error("Async Scan Error:", err);
                await supabase.from('scans').update({
                    status: 'failed',
                    domain_agent_data: { error: err.message }
                }).eq('id', scanId);
            }
        })();

        return NextResponse.json({ scanId });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
