import type { Company, MarketSignal } from "@/types";

export type JobsProvider = {
  getHiringSignals(company: Company): Promise<MarketSignal[]>;
};

export const emptyJobsProvider: JobsProvider = {
  async getHiringSignals() {
    return [];
  }
};
