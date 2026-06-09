import type { EvidenceItem } from "./evidence";
import type { MomentumScore } from "./momentum";
import type { RiskAlert } from "./risk";
import type { CompanyProfile } from "./company";
import type { ESGIntelligenceResult, IntelligenceClassification, InvestorVerdict, RiskStatus } from "./intelligence";

export type MarketSignal = {
  id: string;
  companyId?: string;
  sector?: string;
  region: string;
  signalType: "news" | "jobs" | "patents" | "filings" | "governance" | "finance";
  title: string;
  summary: string;
  observedAt: string;
  confidence: number;
  evidenceIds: string[];
};

export type ESGSignal = {
  id: string;
  category: "environmental" | "social" | "governance";
  direction: "positive" | "neutral" | "negative";
  strength: number;
  evidence: EvidenceItem[];
};

export type MarketScan = {
  id: string;
  region: string;
  sectors: string[];
  generatedAt: string;
  signals: MarketSignal[];
  momentum: MomentumScore[];
  riskAlerts: RiskAlert[];
};

export type SectorScanRequest = {
  region?: string;
  sectors?: string[];
  query?: string;
  exchange?: string;
  limit?: number;
};

export type MarketTrend = {
  ticker: string;
  provider: "Yahoo Finance";
  performance3m?: number;
  performance6m?: number;
  performance12m?: number;
  volatility?: number;
  sector?: string;
  industry?: string;
  trendDirection: "up" | "down" | "flat" | "unavailable";
  capturedAt: string;
};

export type DynamicUniverse = {
  id: string;
  query: SectorScanRequest;
  companies: import("./company").CompanyProfile[];
  statuses: import("./evidence").EvidenceSourceStatus[];
  generatedAt: string;
};

export type MarketScanType = "asean" | "sector" | "exchange" | "custom" | "search";
export type ScanStatus = "queued" | "running" | "partial" | "complete" | "failed" | "cancelled";

export type MarketScanRequest = {
  scanType: MarketScanType;
  query?: string;
  sector?: string;
  exchange?: string;
  country?: string;
  companies?: string[];
  maxCompanies?: number;
  concurrency?: number;
  companyTimeoutMs?: number;
};

export type MarketUniverseCompany = CompanyProfile & {
  universeSource: "provider_search" | "custom_input";
  resolvedFrom?: string;
};

export type MarketUniverse = {
  universeId: string;
  scanType: MarketScanType;
  generatedAt: string;
  query: MarketScanRequest;
  companies: MarketUniverseCompany[];
  providerStatuses: import("./evidence").EvidenceSourceStatus[];
  errors: string[];
};

export type MarketScanCompanyResult = {
  rank: number | null;
  company: CompanyProfile;
  ticker: string;
  country?: string;
  sector?: string;
  status: ESGIntelligenceResult["status"] | "error";
  classification: IntelligenceClassification;
  verdict: InvestorVerdict;
  currentESGSignal: number | null;
  momentumScore: number | null;
  forecastDirection: "positive" | "stable" | "negative" | "unknown";
  confidence: number | null;
  opportunityScore: number | null;
  riskStatus: RiskStatus;
  topPositiveDrivers: string[];
  topRisks: string[];
  evidenceCount: number;
  evidenceIds: string[];
  dataCoverage: number;
  explanation: string;
  intelligence?: ESGIntelligenceResult;
  error?: string;
};

export type RadarSummary = {
  hiddenWinners: MarketScanCompanyResult[];
  futureLeaders: MarketScanCompanyResult[];
  valueTraps: MarketScanCompanyResult[];
  overratedLeaders: MarketScanCompanyResult[];
  criticalRisks: MarketScanCompanyResult[];
};

export type CountryMomentumSummary = {
  country: string;
  providerStatus: string;
  companiesResolved: number;
  companiesAnalysed: number;
  companiesSkipped: number;
  topHiddenWinners: MarketScanCompanyResult[];
  topRisks: string[];
  averageMomentum: number | null;
  dataCoverage: number;
};

export type SectorMomentumSummary = {
  sector: string;
  companiesResolved: number;
  companiesAnalysed: number;
  hiddenWinners: number;
  futureLeaders: number;
  valueTraps: number;
  overratedLeaders: number;
  riskAlerts: number;
  averageMomentum: number | null;
};

export type MarketScanResult = {
  scanId: string;
  scanType: MarketScanType;
  status: ScanStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progress: {
    total: number;
    analysed: number;
    skipped: number;
    percent: number;
    currentCompany?: string;
  };
  summary: {
    companiesScanned: number;
    companiesWithSufficientEvidence: number;
    hiddenWinners: number;
    futureLeaders: number;
    valueTraps: number;
    overratedLeaders: number;
    criticalRisks: number;
    averageMomentum: number | null;
    averageConfidence: number | null;
  };
  results: MarketScanCompanyResult[];
  radar: RadarSummary;
  countrySummaries?: CountryMomentumSummary[];
  sectorSummaries?: SectorMomentumSummary[];
  errors: string[];
};
