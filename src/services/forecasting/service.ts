import type { ForecastScenario, MomentumScore, IntelligenceUnavailable } from "@/types";
import { insufficientEvidence } from "@/utils/evidence";

export class ForecastingService {
  buildBaseline(_momentum: MomentumScore | null, evidenceCount: number): ForecastScenario | IntelligenceUnavailable {
    return insufficientEvidence(evidenceCount);
  }
}

export const forecastingService = new ForecastingService();
