import type { CompanyProfile, DataAvailability, EvidenceCollection, EvidenceItem } from "./index";

export type EsgCategory = "Environmental" | "Social" | "Governance" | "Digital ESG" | "Non-ESG";
export type SentimentLabel = "Positive" | "Neutral" | "Negative";
export type RiskSeverityLabel = "Low" | "Medium" | "High" | "Critical";
export type RiskStatus = "Clear" | "Watch" | "Alert" | "Critical";
export type IntelligenceClassification =
  | "Hidden Winner"
  | "Future Leader"
  | "Value Trap"
  | "Overrated Leader"
  | "Insufficient Evidence";
export type InvestorVerdict = "BUY SIGNAL" | "WATCH" | "HOLD" | "AVOID" | "INSUFFICIENT DATA";

export type ClassifiedEvidence = {
  evidenceId: string;
  category: EsgCategory;
  classificationConfidence: number;
  sentiment: {
    label: SentimentLabel;
    confidence: number;
  };
  weightedSignal: number;
  sourceWeight: number;
  recencyWeight: number;
  modelNames: string[];
};

export type RiskAlert = {
  id: string;
  category:
    | "Environmental Incident"
    | "Labour Dispute"
    | "Human Rights Issue"
    | "Supply Chain Risk"
    | "Governance Scandal"
    | "Regulatory Investigation"
    | "Cybersecurity Incident"
    | "Data Privacy Risk"
    | "AI Governance Risk"
    | "Corruption / Fraud";
  severity: RiskSeverityLabel;
  confidence: number;
  expectedTimeToMarketImpact: "1-3 weeks" | "1-3 months" | "3-6 months";
  evidenceIds: string[];
  rationale: string;
};

export type EvidenceCluster = {
  id: string;
  topic: string;
  representativeEvidenceId: string;
  evidenceIds: string[];
  clusterSize: number;
};

export type DataAvailabilityReport = DataAvailability & {
  meetsMinimumEvidenceThreshold: boolean;
  thresholdReason: string;
  esgRelevantEvidenceCount: number;
};

export type DigitalEsgBreakdown = {
  score: number | null;
  subscores: {
    cybersecurity: number | null;
    dataPrivacy: number | null;
    aiGovernance: number | null;
    digitalInnovation: number | null;
    responsibleTechnology: number | null;
  };
  evidenceReasons: string[];
};

export type ESGIntelligenceResult = {
  status: "complete" | "insufficient_evidence" | "error";
  company: CompanyProfile;
  analysedAt: string;
  dataAvailability: DataAvailabilityReport;
  evidenceSummary: {
    total: number;
    bySource: Record<string, number>;
    byCategory: Record<string, number>;
    clusters: EvidenceCluster[];
  };
  scores: {
    environmental: number | null;
    social: number | null;
    governance: number | null;
    digital: number | null;
    overall: number | null;
    momentum: number | null;
    confidence: number | null;
  } | null;
  classification: IntelligenceClassification;
  risk: {
    status: RiskStatus;
    alerts: RiskAlert[];
  };
  verdict: InvestorVerdict;
  explanation: {
    summary: string;
    positiveDrivers: string[];
    negativeDrivers: string[];
    riskDrivers: string[];
    confidenceExplanation: string;
    evidenceReferences: string[];
  };
  classifiedEvidence?: ClassifiedEvidence[];
  digitalEsg?: DigitalEsgBreakdown;
};

export type IntelligenceInput = {
  company: CompanyProfile;
  evidence?: EvidenceCollection | EvidenceItem[];
};
