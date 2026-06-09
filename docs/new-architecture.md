# New Architecture

ESG Pulse 360 is now organized as an intelligence platform foundation rather than a dashboard.

## Experience Boundaries

- Market Intelligence: command center, market scan engine, hidden winners, red flag radar.
- Company Investigation: investigation route group, company store, evidence, timeline, forecast, and risk contracts.
- Portfolio Intelligence: portfolio route group, portfolio analysis API, portfolio store.
- System Services: API namespaces, providers, database models, config, tokens, and feature flags.

## Implementation Rule

Feature work should add behavior inside `src/features` and `src/services`, then expose it through typed API routes and hooks. Components should render typed data and dispatch store actions only.
