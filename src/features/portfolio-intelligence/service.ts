import type { PortfolioAnalysis, PortfolioHolding } from "@/types";

export async function analyzePortfolio(name: string, holdings: PortfolioHolding[]): Promise<PortfolioAnalysis> {
  return {
    id: "portfolio_foundation",
    name,
    holdings,
    momentum: [],
    riskAlerts: [],
    scenarios: [],
    generatedAt: new Date().toISOString()
  };
}
