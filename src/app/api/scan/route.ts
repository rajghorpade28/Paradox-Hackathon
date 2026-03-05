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

        (async () => {
            try {
                const scrapeData = await scrapeSite(url);

                await supabase.from('scans').update({ status: 'analyzing' }).eq('id', scanId);

                const domainData = analyzeDomain(url);

                const visionData = await analyzeVisuals(scrapeData.screenshot_url, domainData.targetBrand);

                const contentData = analyzeContent(scrapeData.markdown);

                const overallScore = calculateScore(
                    domainData.domainRiskScore,
                    visionData.visualSimilarityScore,
                    contentData.redFlags
                );

                const category = overallScore > 70 ? 'Critical' : overallScore > 30 ? 'Warning' : 'Safe';

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
