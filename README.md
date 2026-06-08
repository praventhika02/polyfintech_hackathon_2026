# ESG Alpha Digital Twin

Forward-looking ESG intelligence for investors. The app combines Supabase Auth, protected dashboard routes, live GDELT news, Yahoo Finance chart data, transparent ESG momentum scoring, company digital twins, hidden-winner radar, early-warning alerts, an evidence-grounded copilot, user profiles, saved watchlists, and ESG alert subscriptions.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and add Supabase keys.

3. Run `supabase/schema.sql` in the Supabase SQL editor.

4. Start the app:

```bash
npm run dev
```

## Auth Routes

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/profile`

Protected routes are enforced in `middleware.ts`: `/dashboard`, `/company/*`, `/hidden-winners`, `/early-warning`, `/copilot`, and `/profile`.

## Product Flow

1. Sign in or create an account.
2. Open `/dashboard`.
3. Search a ticker or company.
4. Review current ESG score, 12-month forecast, momentum, confidence, investor action, and explanation.
5. Save companies in `/profile` and subscribe to alerts.
6. Ask `/copilot` about hidden winners, improving companies, and risks.

## Live Data

- GDELT is used for ESG news evidence without requiring an API key.
- Yahoo Finance chart data is used for market trend context.
- Job, patent, LLM, and satellite connectors are graceful key-based extensions and never fake unavailable data.

## Security

Supabase Row Level Security is enabled for `profiles`, `watchlists`, and `alert_subscriptions`. Users can only read and mutate their own rows. Dashboard routes validate sessions through Next.js middleware and server components.

## Judge Demo

- Login page: premium Bloomberg Terminal x Stripe Dashboard visual style.
- Dashboard: scan live ESG momentum universe.
- Company page: analyze `DBS`, `TSLA`, `MSFT`, or any ticker-like query.
- Hidden Winners: ranked improvers.
- Early Warning: risk evidence and declining momentum.
- Copilot: ask "Which companies are improving ESG fastest?"
