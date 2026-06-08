# ESG Alpha Digital Twin

Forward-looking ESG intelligence for investors. This build adds Supabase Auth, protected dashboard routes, a premium login/register/reset flow, user profiles, saved watchlists, and ESG alert subscriptions.

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

## Security

Supabase Row Level Security is enabled for `profiles`, `watchlists`, and `alert_subscriptions`. Users can only read and mutate their own rows. Dashboard routes validate sessions through Next.js middleware and server components.
