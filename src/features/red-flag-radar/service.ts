import type { RedFlagRadarResult } from "./domain";

export async function scanRedFlags(): Promise<RedFlagRadarResult> {
  return {
    alerts: [],
    generatedAt: new Date().toISOString()
  };
}
