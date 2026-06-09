import type { EvidenceItem, MomentumScore } from "@/types";

export class ScoringService {
  calculateMomentum(companyId: string, evidence: EvidenceItem[]): MomentumScore {
    const confidence = evidence.length ? Math.min(95, 45 + evidence.length * 5) : 35;
    return {
      companyId,
      currentScore: 0,
      forecastScore: 0,
      momentum: 0,
      confidence,
      classification: "value_trap",
      calculatedAt: new Date().toISOString()
    };
  }
}

export const scoringService = new ScoringService();
