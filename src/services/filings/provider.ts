import type { Company, EvidenceItem } from "@/types";

export type FilingsProvider = {
  getFilings(company: Company): Promise<EvidenceItem[]>;
};

export const emptyFilingsProvider: FilingsProvider = {
  async getFilings() {
    return [];
  }
};
