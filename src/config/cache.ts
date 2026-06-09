export const cacheTtlSeconds = {
  news: 60 * 60 * 6,
  jobs: 60 * 60 * 24,
  patents: 60 * 60 * 24 * 7,
  filings: 60 * 60 * 12,
  market: 60 * 60,
  providerHealth: 60 * 30,
  companySearch: 60 * 60,
  companyMetadata: 60 * 60 * 12
} as const;
