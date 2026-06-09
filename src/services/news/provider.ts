import type { Company, EvidenceItem } from "@/types";

export type NewsProvider = {
  searchCompanyNews(company: Company): Promise<EvidenceItem[]>;
};

export const emptyNewsProvider: NewsProvider = {
  async searchCompanyNews() {
    return [];
  }
};
