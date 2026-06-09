import type { EvidenceItem } from "./evidence";
import type { MomentumScore } from "./momentum";
import type { RiskAlert } from "./risk";

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
  limit?: number;
};
