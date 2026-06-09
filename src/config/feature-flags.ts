export type FeatureFlagKey =
  | "ENABLE_MARKET_SCAN"
  | "ENABLE_PORTFOLIO_ANALYSIS"
  | "ENABLE_COPILOT"
  | "ENABLE_ASEAN_MAP"
  | "ENABLE_TIME_MACHINE";

export const featureFlags: Record<FeatureFlagKey, boolean> = {
  ENABLE_MARKET_SCAN: process.env.ENABLE_MARKET_SCAN === "true",
  ENABLE_PORTFOLIO_ANALYSIS: process.env.ENABLE_PORTFOLIO_ANALYSIS === "true",
  ENABLE_COPILOT: process.env.ENABLE_COPILOT === "true",
  ENABLE_ASEAN_MAP: process.env.ENABLE_ASEAN_MAP === "true",
  ENABLE_TIME_MACHINE: process.env.ENABLE_TIME_MACHINE === "true"
};
