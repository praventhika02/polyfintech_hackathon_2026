import type { Company, MarketSignal } from "@/types";
import { emptyPatentsProvider, type PatentsProvider } from "./provider";

export class PatentsService {
  constructor(private readonly provider: PatentsProvider = emptyPatentsProvider) {}

  getInnovationSignals(company: Company): Promise<MarketSignal[]> {
    return this.provider.getInnovationSignals(company);
  }
}

export const patentsService = new PatentsService();
