import type { Company, MarketSignal } from "@/types";
import { emptyFinanceProvider, type FinanceProvider } from "./provider";

export class FinanceService {
  constructor(private readonly provider: FinanceProvider = emptyFinanceProvider) {}

  getMarketSignals(company: Company): Promise<MarketSignal[]> {
    return this.provider.getMarketSignals(company);
  }
}

export const financeService = new FinanceService();
