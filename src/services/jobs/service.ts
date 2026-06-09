import type { Company, MarketSignal } from "@/types";
import { emptyJobsProvider, type JobsProvider } from "./provider";

export class JobsService {
  constructor(private readonly provider: JobsProvider = emptyJobsProvider) {}

  getHiringSignals(company: Company): Promise<MarketSignal[]> {
    return this.provider.getHiringSignals(company);
  }
}

export const jobsService = new JobsService();
