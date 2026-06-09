# ESG Pulse 360

Foundation architecture for a future ESG intelligence platform.

This repository has been reset from a dashboard prototype into an experience-centric Next.js codebase. The current scope is architecture only: route groups, domain types, state stores, API boundaries, service/provider contracts, database model placeholders, feature flags, design tokens, and motion variants.

## Architecture

- `src/app`: Next.js route groups and typed API namespaces.
- `src/features`: domain feature modules for future intelligence workflows.
- `src/services`: service/provider boundaries for external integrations and intelligence services.
- `src/types`: shared TypeScript contracts.
- `src/stores`: Zustand stores split by market, company, portfolio, UI, and copilot state.
- `src/database`: persistence model placeholders.
- `src/styles`: global base styles and design tokens.
- `src/animations`: Framer Motion variant presets.

See `docs/architecture-audit.md` for the full audit and implementation inventory.

## Scripts

```bash
npm run dev
npm run build
```

## Current Scope

The app intentionally does not implement market scans, maps, dashboards, copilot intelligence, portfolio analytics, or investigation screens yet. Those features should be built on top of the new foundation.
