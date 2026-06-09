# ESG Alpha Digital Twin

Don't measure ESG. Predict it.

ESG Alpha Digital Twin is a PolyFinTech100 API Hackathon 2026 CGSI ESG & AI category application. It estimates a company's future ESG momentum from live alternative data, then turns that evidence into forecasts, classifications, risk alerts, and investor action signals.

## Hackathon Alignment

- Solves a real investor problem: ESG ratings lag fast-moving company behaviour.
- Uses AI-style classification and explainability: news is classified into E/S/G, sentiment, and risk types.
- Uses alternative data: GDELT news, Yahoo Finance company and trend data, Adzuna hiring signals, PatentsView innovation signals.
- Gives simple outputs: current score, 12-month forecast, momentum, confidence, class, and Buy/Watch/Hold/Avoid.
- Avoids fake certainty: missing APIs lower confidence and show unavailable states.

## Features

- Landing page with premium fintech product positioning.
- Dashboard with company search by ticker or name.
- Company intelligence pages at `/company/[ticker]`.
- Hidden Winners Radar for improving companies with non-elite current ESG.
- Early Warning page for controversy and declining momentum.
- AI Copilot grounded in fetched ESG analysis data.
- Methodology page explaining weights, confidence, limitations, and sources.
- Next.js API routes for company search, analysis, news, jobs, patents, forecast, and copilot.
- Supabase/PostgreSQL schema for persistent ESG intelligence records.

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind-free custom CSS with Inter and Sora fonts
- Recharts
- Lucide React
- Framer Motion dependency retained for future animation extensions
- Supabase/PostgreSQL schema

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local`.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEWS_API_KEY=
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
OPENAI_API_KEY=
HUGGINGFACE_API_KEY=
PATENTSVIEW_API_KEY=
```

GDELT and Yahoo Finance work without keys. Adzuna and some patent endpoints may require keys or may reject requests depending on availability.

## Database

Run `supabase/schema.sql` in the Supabase SQL editor. The schema stores:

- companies
- esg_analyses
- news_articles
- job_signals
- patent_signals
- forecasts

The current app can run without Supabase persistence; the schema is ready for storing analysis results during a longer build.

## API Routes

- `GET /api/company/search?q=DBS`
- `GET /api/company/analyze?q=TSLA`
- `GET /api/news?q=MSFT`
- `GET /api/jobs?q=Grab`
- `GET /api/patents?q=Toyota`
- `GET /api/forecast?q=NVDA`
- `POST /api/copilot`

## Scoring

The editable formula lives in `lib/esg/config.ts`.

```text
ESG Momentum Score =
0.35 * news_esg_sentiment
+ 0.20 * green_job_hiring_signal
+ 0.20 * patent_innovation_signal
+ 0.15 * governance_signal
+ 0.10 * trend_consistency
```

Confidence increases with data-source coverage and recent evidence. It decreases when evidence is sparse or ESG risks dominate.

## Demo Flow For Judges

1. Open `/`.
2. Click `Open Dashboard`.
3. Search `DBS`, `TSLA`, `MSFT`, or another listed company.
4. Show the current ESG signal, forecast, momentum matrix, risk alerts, and evidence list.
5. Open `/hidden-winners`.
6. Open `/early-warning`.
7. Ask `/copilot`: "Which companies are improving ESG fastest?"
8. Close with `/methodology` to show transparent scoring and limitations.

## Limitations

This is forward-looking ESG decision support, not official financial advice. Public data can be noisy, APIs can rate-limit, and company naming differences can affect retrieval. The app deliberately shows lower confidence or unavailable states when external evidence is incomplete.
