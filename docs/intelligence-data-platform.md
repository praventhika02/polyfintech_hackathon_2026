# Intelligence Data Platform

## Audit

The current platform contains no fabricated ESG scores, momentum rankings, forecasts, company universes, or investment signals. The remaining intelligence services return `Insufficient evidence available.` when collected evidence is not adequate.

The previous score-oriented persistence model has been replaced by evidence-first tables. Company search is provider-driven and does not rely on a built-in company list. A tiny alias resolver exists only for common ticker shorthand such as DBS, OCBC, and UOB.

## Files Created

- Company discovery providers: `src/services/company/*`
- Evidence collector: `src/services/evidence/collection-service.ts`
- Runtime/Supabase evidence repository: `src/services/storage/evidence-repository.ts`
- Provider utilities: `src/utils/cache.ts`, `src/utils/http.ts`, `src/utils/evidence.ts`
- Cache and keyword config: `src/config/cache.ts`, `src/config/keywords.ts`
- Evidence API routes under `src/app/api/evidence/*`
- Provider health API: `src/app/api/provider/health/route.ts`
- Dynamic universe APIs: `src/app/api/market/universe/route.ts`, `src/app/api/market/sector-universe/route.ts`

## Files Modified

- Shared types under `src/types/*`
- Company, market, scoring, forecasting, and copilot services
- Company and market API routes
- Supabase schema
- README

## Files Deleted

- The old score-oriented Supabase schema content was removed and replaced.

## Services Added

- `CompanyDiscoveryService`
- `EvidenceCollectionService`
- `RuntimeEvidenceRepository`
- Live-source news, jobs, patents, filings, governance, and finance services

## Providers Added

- Yahoo Finance search, metadata, market trends
- Financial Modeling Prep search when `FMP_API_KEY` is configured
- Polygon search when `POLYGON_API_KEY` is configured
- NewsAPI when `NEWSAPI_KEY` is configured
- GNews when `GNEWS_API_KEY` is configured
- GDELT article search
- Adzuna jobs when `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` are configured
- PatentsView patent search
- Filing provider status reporting for SGX, Bursa Malaysia, and SET Thailand

## Routes Added

- `GET /api/company/search?q=DBS`
- `GET /api/company/metadata?ticker=MSFT`
- `POST /api/company/analyze`
- `GET /api/evidence/collection?ticker=MSFT`
- `GET /api/evidence/news?ticker=MSFT`
- `GET /api/evidence/jobs?ticker=MSFT`
- `GET /api/evidence/patents?ticker=MSFT`
- `GET /api/evidence/filings?ticker=D05.SI`
- `GET /api/evidence/governance?ticker=MSFT`
- `GET /api/evidence/market?ticker=MSFT`
- `GET /api/provider/health`
- `POST /api/market/universe`
- `POST /api/market/sector-universe`

## Storage Models Added

- `companies`
- `evidence`
- `news_evidence`
- `job_evidence`
- `patent_evidence`
- `filing_evidence`
- `governance_evidence`
- `market_signals`
- `scan_history`
- `provider_health`

## Caching

- News: 6 hours
- Jobs: 24 hours
- Patents: 7 days
- Filings: 12 hours
- Market: 1 hour
- Provider health: 30 minutes

## Testing Instructions

Run the app and query:

```bash
npm run dev
```

Use these tickers or names through `/api/company/search`, `/api/company/metadata`, and `/api/evidence/collection`:

```text
DBS
OCBC
UOB
Sea
Grab
Tesla
Microsoft
Nvidia
Apple
Unknown Company
```

Expected result: live evidence records, or provider statuses explaining why evidence is unavailable. The platform must not return an ESG score, momentum score, ranking, forecast, or investment signal without evidence.

## Environment Variables

- `NEWSAPI_KEY`
- `GNEWS_API_KEY`
- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`
- `FMP_API_KEY`
- `POLYGON_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`

## Known Limitations

- Filing feeds report availability status until exchange-specific feed credentials or endpoints are connected.
- Supabase persistence is used only when Supabase environment variables are present; otherwise evidence is retained for the running server process.
- Scoring, hidden-winner detection, forecasts, and investment signals are intentionally disabled until evidence-backed models are implemented.
