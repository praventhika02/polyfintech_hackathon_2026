import type { Company } from "./company";
import type { ForecastScenario } from "./forecast";
import type { MomentumScore } from "./momentum";
import type { RiskAlert } from "./risk";

export type PortfolioHolding = {
  company: Company;
  weight: number;
};

export type PortfolioAnalysis = {
  id: string;
  name: string;
  holdings: PortfolioHolding[];
  momentum: MomentumScore[];
  riskAlerts: RiskAlert[];
  scenarios: ForecastScenario[];
  generatedAt: string;
};
