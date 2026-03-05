# 🛡️ Paradox: Phishing Intelligence Dashboard

A real-time, multi-agent AI engine for detecting phishing threats, domain typosquatting, and visual brand spoofing.

## 🚀 Features
- **Typosquatting Analysis**: Uses Levenshtein distance to detect domains close to major brands (PayPal, Chase, Apple, etc.).
- **Live Content Scraping**: Integrated with **Firecrawl** to scrape screenshots and markdown from suspicious URLs.
- **Multimodal Vision matching**: Deploys **Gemini 1.5 Flash** to visually compare site screenshots against target brands with observations.
- **Real-time Pipeline**: Built with **Appwrite Realtime** — see agent steps advance as the backend processes.

## 🛠️ Tech Stack
- **Frontend**: Next.js, Framer Motion, Recharts, Tailwind CSS.
- **Backend (Agents)**: Python 3.11/12, Appwrite Functions.
- **AI Models**: Google Gemini 1.5 Flash, Firecrawl Scraper.

## 🚀 Quick Start (Supabase Migration)

We have migrated to **Supabase** for a more reliable, single-process experience. The AI agents now run directly inside the Next.js server.

### 1. Database Setup
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** and paste the contents of `supabase_setup.sql`. Run it.
3. In **Project Settings > API**, copy your `URL` and `anon public` key.

### 2. Environment Variables
Update your `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_ai_studio_key
FIRECRAWL_API_KEY=your_firecrawl_key
```

### 3. Run Locally
```bash
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to start scanning!

---

## 🏗️ Project Structure
- `src/`: Next.js frontend source.
- `backend/phishing-function/`: Python backend engine (Appwrite Function code).
- `DEPLOYMENT.md`: Step-by-step setup guide for Appwrite.
