create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  ticker text not null unique,
  name text not null,
  exchange text,
  country text,
  sector text,
  market_cap numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.esg_analyses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  ticker text not null,
  current_score numeric not null,
  forecast_score numeric not null,
  momentum_score numeric not null,
  confidence_score numeric not null,
  investor_signal text not null check (investor_signal in ('Buy', 'Watch', 'Hold', 'Avoid')),
  classification text not null check (classification in ('Hidden Winner', 'Future Leader', 'Value Trap', 'Overrated Leader')),
  signal_breakdown jsonb not null default '{}'::jsonb,
  explanation jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  coverage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid references public.esg_analyses(id) on delete cascade,
  ticker text not null,
  title text not null,
  url text,
  source text,
  category text check (category in ('E', 'S', 'G')),
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  risk_type text,
  published_at text,
  created_at timestamptz not null default now()
);

create table if not exists public.job_signals (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid references public.esg_analyses(id) on delete cascade,
  ticker text not null,
  available boolean not null default false,
  score numeric not null,
  count integer not null default 0,
  source text not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.patent_signals (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid references public.esg_analyses(id) on delete cascade,
  ticker text not null,
  available boolean not null default false,
  score numeric not null,
  count integer not null default 0,
  source text not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.forecasts (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid references public.esg_analyses(id) on delete cascade,
  ticker text not null,
  month text not null,
  score numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists esg_analyses_ticker_created_at_idx on public.esg_analyses (ticker, created_at desc);
create index if not exists news_articles_ticker_created_at_idx on public.news_articles (ticker, created_at desc);
