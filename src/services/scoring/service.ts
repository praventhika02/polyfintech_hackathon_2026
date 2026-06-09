import type { EvidenceItem, MomentumResult } from "@/types";
import { insufficientEvidence } from "@/utils/evidence";

export class ScoringService {
  calculateMomentum(_companyId: string, evidence: EvidenceItem[]): MomentumResult {
    return insufficientEvidence(evidence.length);
  }
}

export const scoringService = new ScoringService();
