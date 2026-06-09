import type { Company, MarketSignal } from "@/types";

export type PatentsProvider = {
  getInnovationSignals(company: Company): Promise<MarketSignal[]>;
};

export const emptyPatentsProvider: PatentsProvider = {
  async getInnovationSignals() {
    return [];
  }
};
