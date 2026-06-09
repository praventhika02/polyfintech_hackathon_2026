import type { Company, EvidenceItem } from "@/types";
import { emptyNewsProvider, type NewsProvider } from "./provider";

export class NewsService {
  constructor(private readonly provider: NewsProvider = emptyNewsProvider) {}

  getCompanyEvidence(company: Company): Promise<EvidenceItem[]> {
    return this.provider.searchCompanyNews(company);
  }
}

export const newsService = new NewsService();
