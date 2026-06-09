import type { EvidenceItem } from "./evidence";

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export type RiskAlert = {
  id: string;
  companyId?: string;
  severity: RiskSeverity;
  category: "environmental" | "social" | "governance" | "market" | "data-quality";
  title: string;
  rationale: string;
  detectedAt: string;
  evidence: EvidenceItem[];
};
