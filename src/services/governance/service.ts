import { cacheTtlSeconds } from "@/config/cache";
import { governanceKeywords } from "@/config/keywords";
import type { CompanyProfile, EvidenceItem, EvidenceSourceStatus } from "@/types";
import { matchedKeywords, sourceStatus } from "@/utils/evidence";
import { stableId } from "@/utils/ids";

export class GovernanceService {
  extractGovernanceEvidence(company: CompanyProfile, inputs: EvidenceItem[]): { items: EvidenceItem[]; statuses: EvidenceSourceStatus[] } {
    const items = inputs
      .map((item): EvidenceItem | null => {
        const matches = matchedKeywords(`${item.title} ${item.description || ""} ${item.excerpt || ""}`, governanceKeywords);
        if (!matches.length) return null;
        return {
          ...item,
          id: stableId("governance", `${item.id}:${matches.join(",")}`),
          source: "governance" as const,
          category: "governance" as const,
          provider: "System" as const,
          companyId: company.id,
          ticker: company.ticker,
          title: `Governance signal: ${item.title}`,
          matchedKeywords: matches,
          tags: Array.from(new Set([...item.tags, "governance", ...matches])),
          rawMetadata: {
            derivedFromEvidenceId: item.id,
            originalProvider: item.provider,
            originalSource: item.source
          }
        } satisfies EvidenceItem;
      })
      .filter((item): item is EvidenceItem => Boolean(item));

    return {
      items,
      statuses: [
        sourceStatus(
          "governance",
          "System",
          items.length ? "available" : "unavailable",
          items.length,
          items.length ? "Governance evidence extracted from collected evidence." : "No governance keywords found in collected evidence.",
          cacheTtlSeconds.filings
        )
      ]
    };
  }
}

export const governanceService = new GovernanceService();
