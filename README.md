# ESG Pulse 360

Forward-looking ESG momentum intelligence for PolyFinTech100 2026.

## Problem

Traditional ESG ratings mostly describe what companies have already reported. Investors need an earlier signal: which companies are improving, which are becoming risky, and which trajectories could matter before annual ESG scores refresh.

## Solution

ESG Pulse 360 answers four investor questions:

1. Is this company's ESG improving right now? Momentum Tracker.
2. Is this company quietly becoming a risk? Red Flag Radar.
3. Is digital transformation an ESG asset or liability? Digital ESG Score.
4. Where could ESG be in 12 months? ESG Time Machine.

## Architecture

```text
Next.js App Router
  app routes: landing, investigate, radar, compare, watchlist, methodology
  API routes: /api/company/search, /api/company/analyze
  lib/esg:
    connectors.ts -> Yahoo Finance, GDELT, Adzuna, PatentsView
    scoring.ts    -> runtime scoring and verdict logic
    universe.ts   -> radar seed universe and ticker fallbacks
```

## Data Sources

- Yahoo Finance: company lookup and market trend proxy.
- GDELT: public news evidence.
- Adzuna: optional hiring signal via `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`.
- PatentsView: green innovation patent signal.

Missing sources are skipped or marked unavailable. The UI does not invent evidence.

## Scoring

Scores are computed at runtime from available signals. The aggregate renormalizes over sources that returned data, so missing API keys lower confidence instead of adding fake neutral evidence.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Optional environment variables:

```text
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
```

## Demo Flow

1. Open `/investigate`.
2. Search `DBS`, `TSLA`, or `MSFT`.
3. Walk through the six missions and investor verdict.
4. Save a company, then open `/watchlist`.
5. Open `/compare?q=DBS,TSLA,MSFT`.
6. Open `/radar` to scan the curated ASEAN/global universe.

## Judging Criteria Alignment

- Real investor problem: shifts ESG from static rating to momentum and risk trajectory.
- Simple output: every investigation ends with BUY SIGNAL, WATCH, HOLD, or AVOID.
- Meaningful insight: evidence cards expose exactly what influenced the score.
- Original thinking: Digital ESG and Time Machine make ESG direction tangible.
- Practical build: runs as a Next.js proof of concept with public data connectors and no external LLM scoring API.

## Scope

This build does not include satellite data, portfolio optimization, authenticated user accounts, or a full Python/HuggingFace backend. The methodology page states this honestly. The current implementation is a working investor-facing proof of concept built around transparent runtime scoring.
