import type { DigitalEsgProfile } from "./domain";

export async function buildDigitalEsgProfile(companyId: string): Promise<DigitalEsgProfile> {
  return {
    companyId,
    score: 0,
    drivers: [],
    generatedAt: new Date().toISOString()
  };
}
