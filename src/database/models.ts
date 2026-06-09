import type {
  Company,
  EvidenceItem,
  MarketSignal,
  EvidenceSourceStatus,
  MarketTrend
} from "@/types";

export type CompanyRecord = Company & {
  createdAt: string;
  updatedAt: string;
};

export type EvidenceRecord = EvidenceItem & {
  companyId?: string;
};

export type NewsEvidenceRecord = EvidenceRecord & { source: "news" };

export type JobEvidenceRecord = EvidenceRecord & { source: "jobs" };

export type PatentEvidenceRecord = EvidenceRecord & { source: "patents" };

export type FilingEvidenceRecord = EvidenceRecord & { source: "filings" };

export type GovernanceEvidenceRecord = EvidenceRecord & { source: "governance" };

export type MarketSignalRecord = MarketTrend | MarketSignal;

export type ScanHistoryRecord = {
  id: string;
  scanType: "market" | "company" | "portfolio";
  status: "queued" | "running" | "completed" | "failed";
  requestedAt: string;
  completedAt?: string;
  inputHash: string;
};

export type ProviderHealthRecord = EvidenceSourceStatus;
