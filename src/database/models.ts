import type {
  Company,
  CopilotConversation,
  EvidenceItem,
  ForecastScenario,
  MarketSignal,
  PortfolioAnalysis,
  RiskAlert
} from "@/types";

export type CompanyRecord = Company & {
  createdAt: string;
  updatedAt: string;
};

export type MarketSignalRecord = MarketSignal;

export type EvidenceRecord = EvidenceItem & {
  companyId?: string;
};

export type RiskAlertRecord = RiskAlert;

export type ForecastRecord = ForecastScenario;

export type PortfolioAnalysisRecord = PortfolioAnalysis;

export type ScanHistoryRecord = {
  id: string;
  scanType: "market" | "company" | "portfolio";
  status: "queued" | "running" | "completed" | "failed";
  requestedAt: string;
  completedAt?: string;
  inputHash: string;
};

export type CopilotConversationRecord = CopilotConversation & {
  userId?: string;
};
