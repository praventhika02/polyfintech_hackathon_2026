import type { ForecastScenario, MomentumScore } from "@/types";

export class ForecastingService {
  buildBaseline(momentum: MomentumScore): ForecastScenario {
    return {
      id: `forecast_${momentum.companyId}_baseline`,
      companyId: momentum.companyId,
      label: "Baseline",
      assumptions: ["No scenario assumptions configured in foundation layer."],
      horizonMonths: 12,
      points: [],
      generatedAt: new Date().toISOString()
    };
  }
}

export const forecastingService = new ForecastingService();
