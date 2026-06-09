export type EvidenceSource =
  | "news"
  | "jobs"
  | "patents"
  | "finance"
  | "filings"
  | "governance"
  | "manual";

export type EvidenceProvider =
  | "Yahoo Finance"
  | "Financial Modeling Prep"
  | "Polygon"
  | "NewsAPI"
  | "GNews"
  | "GDELT"
  | "Adzuna"
  | "PatentsView"
  | "SGX"
  | "Bursa Malaysia"
  | "SET Thailand"
  | "System";

export type EvidenceConfidence = "high" | "medium" | "low" | "unavailable";

export type EvidenceCategory =
  | "company_metadata"
  | "news"
  | "job"
  | "patent"
  | "filing"
  | "governance"
  | "market"
  | "provider_health";

export type EvidenceSourceStatus = {
  source: EvidenceSource | "company";
  provider: EvidenceProvider;
  status: "available" | "unavailable" | "missing_api_key" | "timeout" | "rate_limited" | "error";
  evidenceCount: number;
  message: string;
  checkedAt: string;
  cacheTtlSeconds: number;
};

export type EvidenceItem = {
  id: string;
  source: EvidenceSource;
  provider: EvidenceProvider;
  category: EvidenceCategory;
  companyId?: string;
  ticker?: string;
  title: string;
  description?: string;
  url?: string;
  publisher?: string;
  publishedAt?: string;
  capturedAt: string;
  excerpt?: string;
  reliability: number;
  confidence: EvidenceConfidence;
  matchedKeywords: string[];
  language?: string;
  tags: string[];
  rawMetadata: Record<string, unknown>;
};

export type EvidenceCollection = {
  companyId?: string;
  ticker?: string;
  collectedAt: string;
  items: EvidenceItem[];
  statuses: EvidenceSourceStatus[];
  summary: {
    news: number;
    jobs: number;
    patents: number;
    filings: number;
    governance: number;
    market: number;
  };
};

export type DataAvailability = {
  companyId?: string;
  ticker?: string;
  lastUpdated: string;
  statuses: EvidenceSourceStatus[];
  evidenceCounts: EvidenceCollection["summary"];
  providerHealth: EvidenceSourceStatus[];
};
