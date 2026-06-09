create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id text primary key,
  ticker text not null unique,
  name text not null,
  exchange text,
  country text,
  sector text,
  industry text,
  market_cap numeric,
  currency text,
  website text,
  business_summary text,
  employee_count integer,
  data_provider text,
  search_aliases jsonb not null default '[]'::jsonb,
  metadata_confidence numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence (
  id text primary key,
  company_id text references public.companies(id) on delete set null,
  ticker text,
  source text not null,
  provider text not null,
  category text not null,
  title text not null,
  description text,
  url text,
  publisher text,
  published_at text,
  captured_at timestamptz not null,
  excerpt text,
  reliability numeric not null,
  confidence text not null,
  matched_keywords jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  raw_metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.news_evidence (
  evidence_id text primary key references public.evidence(id) on delete cascade
);

create table if not exists public.job_evidence (
  evidence_id text primary key references public.evidence(id) on delete cascade
);

create table if not exists public.patent_evidence (
  evidence_id text primary key references public.evidence(id) on delete cascade
);

create table if not exists public.filing_evidence (
  evidence_id text primary key references public.evidence(id) on delete cascade
);

create table if not exists public.governance_evidence (
  evidence_id text primary key references public.evidence(id) on delete cascade,
  derived_from_evidence_id text references public.evidence(id) on delete set null
);

create table if not exists public.market_signals (
  id text primary key,
  company_id text references public.companies(id) on delete set null,
  ticker text,
  provider text not null,
  performance_3m numeric,
  performance_6m numeric,
  performance_12m numeric,
  volatility numeric,
  sector text,
  industry text,
  trend_direction text not null,
  captured_at timestamptz not null,
  raw_metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.scan_history (
  id text primary key,
  scan_type text not null,
  query jsonb not null,
  status text not null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  result_metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.provider_health (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  provider text not null,
  status text not null,
  evidence_count integer not null default 0,
  message text not null,
  checked_at timestamptz not null,
  cache_ttl_seconds integer not null
);

create index if not exists companies_ticker_idx on public.companies (ticker);
create index if not exists evidence_ticker_captured_at_idx on public.evidence (ticker, captured_at desc);
create index if not exists evidence_source_provider_idx on public.evidence (source, provider);
create index if not exists market_signals_ticker_captured_at_idx on public.market_signals (ticker, captured_at desc);
create index if not exists provider_health_provider_checked_at_idx on public.provider_health (provider, checked_at desc);
