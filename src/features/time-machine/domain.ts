import type { ForecastScenario } from "@/types";

export type TimeMachineResult = {
  scenarios: ForecastScenario[];
  generatedAt: string;
  message: "Insufficient evidence available.";
};
