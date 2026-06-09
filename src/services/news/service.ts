import type { CompanyProfile, EvidenceItem, EvidenceSourceStatus } from "@/types";
import { fetchGdeltEvidence, fetchGNewsEvidence, fetchNewsApiEvidence } from "./providers";

export class NewsService {
  async getCompanyEvidence(company: CompanyProfile, limit = 20): Promise<{ items: EvidenceItem[]; statuses: EvidenceSourceStatus[] }> {
    const results = await Promise.all([fetchNewsApiEvidence(company, limit), fetchGNewsEvidence(company, limit), fetchGdeltEvidence(company, limit)]);
    const itemsById = new Map<string, EvidenceItem>();
    results.flatMap((result) => result.items).forEach((item) => itemsById.set(item.id, item));
    return {
      items: Array.from(itemsById.values()).slice(0, limit),
      statuses: results.map((result) => result.status)
    };
  }
}

export const newsService = new NewsService();
