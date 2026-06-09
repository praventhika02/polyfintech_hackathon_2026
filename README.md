
# ESG Pulse 360

Evidence-first architecture for a future ESG intelligence platform.

This repository has been reset from an old dashboard into an experience-centric Next.js codebase. The current scope is the intelligence data platform: route groups, domain types, state stores, typed API boundaries, provider contracts, evidence storage models, feature flags, design tokens, and motion variants.

## Architecture

- `src/app`: Next.js route groups and typed API namespaces.
- `src/features`: domain feature modules for future intelligence workflows.
- `src/services`: service/provider boundaries for external integrations and intelligence services.
- `src/types`: shared TypeScript contracts.
- `src/stores`: Zustand stores split by market, company, portfolio, UI, and copilot state.
- `src/database`: persistence model contracts.
- `src/styles`: global base styles and design tokens.
- `src/animations`: Framer Motion variant presets.

See `docs/intelligence-data-platform.md` for the current data platform audit and implementation inventory.

## Scripts

```bash
npm run dev
npm run build
```

## Current Scope

The app intentionally does not infer ESG scores, momentum, forecasts, rankings, or investment signals without collected evidence.




