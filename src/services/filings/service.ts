import type { Company, EvidenceItem } from "@/types";
import { emptyFilingsProvider, type FilingsProvider } from "./provider";

export class FilingsService {
  constructor(private readonly provider: FilingsProvider = emptyFilingsProvider) {}

  getFilings(company: Company): Promise<EvidenceItem[]> {
    return this.provider.getFilings(company);
  }
}

export const filingsService = new FilingsService();
