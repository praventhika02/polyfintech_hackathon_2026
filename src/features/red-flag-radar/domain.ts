import type { RiskAlert } from "@/types";

export type RedFlagRadarResult = {
  alerts: RiskAlert[];
  generatedAt: string;
};
