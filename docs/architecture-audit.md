# ESG Pulse 360 Architecture Audit

## Executive Summary

The previous codebase was a page-centric dashboard prototype. It mixed product flows, external data access, scoring logic, animation, storage, charting, and presentation inside route files and large client components. The reset moves the project to an experience-centric `src/` architecture organized around market intelligence, company investigation, portfolio intelligence, and system services.

## Audit Findings

### Dead Or Legacy Files

- `public/index.html` and `public/styles.css` were static prototype artifacts outside the Next.js app.
- `app/dashboard/page.tsx` existed only as a compatibility redirect.
- `app/hidden-winners/page.tsx` existed only as a compatibility redirect.
- Top-level route files such as `app/radar/page.tsx`, `app/early-warning/page.tsx`, `app/compare/page.tsx`, and `app/watchlist/page.tsx` encoded feature names as pages instead of experience domains.

### Duplicate And Mixed Components

- `components/dashboard/*` grouped unrelated investigation, signal, evidence, and matrix responsibilities by old UI location.
- `components/mission/MissionMode.tsx` combined mission progress, company profile, evidence scan rows, momentum calculations, risk display, digital score display, forecast scenario generation, localStorage watchlist writes, chart rendering, and navigation.
- `components/cards/CompanyCard.tsx` and dashboard-specific cards repeated card semantics without a shared component contract.

### Unused Or Weak Boundaries

- No dedicated hooks layer existed for API access or feature flags.
- Components imported domain types directly from `lib/esg`, tying UI to prototype implementation details.
- API routes called connector/scoring functions directly rather than going through domain services.

### Unused API Routes And Legacy API Shape

- `app/api/news`, `app/api/jobs`, `app/api/patents`, and `app/api/forecast` exposed provider-specific endpoints instead of domain APIs.
- `app/api/company/analyze` and `app/api/company/search` were useful concepts but returned unversioned, loosely structured JSON.
- There was no `api/market`, `api/portfolio`, or `api/health` namespace.

### Placeholder Implementations

- Live external connectors had fallback behavior embedded beside provider logic.
- Scoring and forecasting contained prototype heuristics that belonged in future intelligence services, not in UI components or page routes.

### Duplicate Styles And Design Risk

- Global CSS mixed design tokens, component styles, route styles, animation keyframes, and page layout rules.
- No separate token source existed for colors, spacing, typography, radius, shadows, z-index, glass, or motion timing.

## Files Deleted

- Root `app/**` pages and legacy API routes.
- Root `components/**` dashboard, mission, card, chart, copilot, compare, layout, watchlist, and UI components.
- Root `lib/esg/**` prototype connector, scoring, universe, config, and type files.
- Static prototype files `public/index.html` and `public/styles.css`.

## Files Renamed Or Moved

- The old `app/` tree was replaced by `src/app/`.
- The old `lib/esg/types.ts` responsibility was split into `src/types/*`.
- The old `lib/esg/connectors.ts` responsibility was split into `src/services/*/provider.ts` and `src/services/*/service.ts`.
- The old global styling responsibility was split into `src/styles/globals.css` and `src/styles/tokens.ts`.

## Files Created

- `src/app/(command-center)`, `src/app/(investigation)`, `src/app/(portfolio)`, `src/app/(methodology)`, and `src/app/(settings)` route groups.
- `src/app/api/market`, `src/app/api/company`, `src/app/api/portfolio`, `src/app/api/copilot`, and `src/app/api/health` API namespaces.
- `src/types/*` shared domain and API types.
- `src/stores/*` Zustand stores for market, company, portfolio, UI, and copilot state.
- `src/features/*` feature modules for market scan, hidden winners, red flag radar, digital ESG, time machine, portfolio intelligence, and copilot.
- `src/services/*` service/provider boundaries for news, jobs, patents, finance, filings, governance, scoring, and forecasting.
- `src/database/*` database model and table registry placeholders.
- `src/config/*`, `src/styles/*`, `src/animations/*`, `src/hooks/*`, and `src/utils/*`.

## New Folder Structure

```text
src/
  app/
    (command-center)/
    (investigation)/
    (portfolio)/
    (methodology)/
    (settings)/
    api/
      market/
      company/
      portfolio/
      copilot/
      health/
  components/
    command-center/
    investigation/
    portfolio/
    maps/
    timeline/
    evidence/
    animations/
    shared/
  features/
    market-scan/
    hidden-winners/
    red-flag-radar/
    digital-esg/
    time-machine/
    portfolio-intelligence/
    copilot/
  services/
    news/
    jobs/
    patents/
    finance/
    filings/
    governance/
    scoring/
    forecasting/
  database/
  models/
  types/
  hooks/
  utils/
  config/
  styles/
  assets/
```

## State Architecture

Zustand is used because the product needs small, independent experience stores rather than one large global reducer. Stores are separated as:

- `marketStore`: active scan, market signals, scan state.
- `companyStore`: active company, evidence, risk alerts, momentum, forecasts.
- `portfolioStore`: holdings and active portfolio analysis.
- `uiStore`: navigation and active experience state.
- `copilotStore`: current conversation, pending state, message append operations.

## API Architecture

All API responses use `ApiResponse<T>` with metadata. Current namespaces are:

- `api/market/scan`: market scan entry point.
- `api/company/search`: company lookup entry point.
- `api/company/analyze`: company scoring entry point.
- `api/portfolio/analyze`: portfolio analysis entry point.
- `api/copilot`: copilot entry point.
- `api/health`: platform health check.

External providers should flow through:

```text
component -> hook -> api route -> feature service -> service -> provider
```

## Domain Architecture

- Market Domain: `features/market-scan`, `features/hidden-winners`, `features/red-flag-radar`.
- Company Domain: `app/(investigation)`, `companyStore`, evidence/risk/momentum/forecast types.
- Portfolio Domain: `features/portfolio-intelligence`, `portfolioStore`, portfolio API.
- Intelligence Domain: `services/scoring`, `services/forecasting`, `features/time-machine`, `features/copilot`.
- Infrastructure Domain: `app/api`, `services/*/provider`, `database`, `config`, `utils`.

## Type Architecture

Shared domain types are split by responsibility:

- `Company`
- `MarketSignal`
- `ESGSignal`
- `EvidenceItem`
- `RiskAlert`
- `MomentumScore`
- `ForecastScenario`
- `PortfolioAnalysis`
- `CopilotConversation`
- `ApiResponse<T>`

No `any` is used in the new architecture files.

## Database Architecture

The schema layer is prepared but not implemented. Model placeholders exist for:

- `companies`
- `market_signals`
- `evidence`
- `risk_alerts`
- `forecasts`
- `portfolio_analyses`
- `scan_history`
- `copilot_conversations`

## Design System Architecture

The design foundation is token-only:

- `colors`
- `spacing`
- `typography`
- `radius`
- `shadows`
- `zIndex`
- `animation`
- `glass`

Global CSS now contains only browser/base application styles.

## Animation Architecture

Framer Motion variants are prepared in `src/animations/variants.ts`:

- `pageTransitionVariants`
- `cardRevealVariants`
- `timelineVariants`
- `scanAnimationVariants`
- `counterVariants`

They are not used yet, per the reset scope.
