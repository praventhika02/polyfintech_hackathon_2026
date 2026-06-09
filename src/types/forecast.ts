export type ForecastPoint = {
  period: string;
  score: number;
  confidenceLow?: number;
  confidenceHigh?: number;
};

export type ForecastScenario = {
  id: string;
  companyId: string;
  label: string;
  assumptions: string[];
  horizonMonths: number;
  points: ForecastPoint[];
  generatedAt: string;
};
