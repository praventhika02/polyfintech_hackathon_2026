export type Company = {
  id: string;
  name: string;
  ticker: string;
  exchange?: string;
  country?: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  currency?: string;
  beta?: number;
  dataProvider?: string;
  lastUpdated?: string;
  searchAliases?: string[];
  metadataConfidence?: number;
};

export type CompanyProfile = Company & {
  description?: string;
  website?: string;
  headquarters?: string;
  employeeCount?: number;
  lastAnalysedAt?: string;
};

export type CompanySearchQuery = {
  query: string;
  limit?: number;
};

export type CompanySearchResult = {
  companies: CompanyProfile[];
  status: "available" | "unavailable";
  providerStatuses: import("./evidence").EvidenceSourceStatus[];
};
