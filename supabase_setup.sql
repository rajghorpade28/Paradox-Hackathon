-- Run this in your Supabase SQL Editor to create the necessary table

CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'scraping', 'analyzing', 'completed', 'failed'
  overall_risk_score INTEGER DEFAULT 0,
  risk_category TEXT,
  domain_agent_data JSONB DEFAULT '{}',
  vision_agent_data JSONB DEFAULT '{}',
  content_agent_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE scans;

-- DISABLE RLS for the hackathon so we can insert/read results without complex auth
ALTER TABLE scans DISABLE ROW LEVEL SECURITY;
