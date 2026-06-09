import type { Company, MarketSignal } from "@/types";

export type FinanceProvider = {
  getMarketSignals(company: Company): Promise<MarketSignal[]>;
};

export const emptyFinanceProvider: FinanceProvider = {
  async getMarketSignals() {
    return [];
  }
};
