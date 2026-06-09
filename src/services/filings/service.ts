import { cacheTtlSeconds } from "@/config/cache";
import type { CompanyProfile, EvidenceItem, EvidenceSourceStatus } from "@/types";
import { sourceStatus } from "@/utils/evidence";

export class FilingsService {
  async getFilingEvidence(company: CompanyProfile): Promise<{ items: EvidenceItem[]; statuses: EvidenceSourceStatus[] }> {
    const provider =
      company.exchange?.toUpperCase().includes("SGX") || company.ticker.endsWith(".SI")
        ? "SGX"
        : company.exchange?.toUpperCase().includes("BURSA") || company.ticker.endsWith(".KL")
          ? "Bursa Malaysia"
          : company.exchange?.toUpperCase().includes("SET") || company.ticker.endsWith(".BK")
            ? "SET Thailand"
            : "System";

    return {
      items: [],
      statuses: [
        sourceStatus(
          "filings",
          provider,
          "unavailable",
          0,
          "Public filing feed integration is not configured for this provider. No filing evidence was fabricated.",
          cacheTtlSeconds.filings
        )
      ]
    };
  }
}

export const filingsService = new FilingsService();
