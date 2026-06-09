import { cacheTtlSeconds } from "@/config/cache";
import { patentKeywords } from "@/config/keywords";
import type { CompanyProfile, EvidenceItem, EvidenceSourceStatus } from "@/types";
import { cached } from "@/utils/cache";
import { confidenceFromMatches, matchedKeywords, sourceStatus } from "@/utils/evidence";
import { fetchJson, ProviderError } from "@/utils/http";
import { stableId } from "@/utils/ids";

type PatentsViewPatent = {
  patent_id?: string;
  patent_title?: string;
  patent_date?: string;
  assignees?: Array<{ assignee_organization?: string }>;
};

type PatentsViewResponse = {
  patents?: PatentsViewPatent[];
  total_patent_count?: number;
};

export class PatentsService {
  async getPatentEvidence(company: CompanyProfile, limit = 20): Promise<{ items: EvidenceItem[]; statuses: EvidenceSourceStatus[] }> {
    return cached(`patents:patentsview:${company.ticker}:${limit}`, cacheTtlSeconds.patents, async () => {
      try {
        const keywordQuery = patentKeywords.map((keyword) => `"${keyword}"`).join(" OR ");
        const q = encodeURIComponent(`assignee_organization:"${company.name}" AND (${keywordQuery})`);
        const url = `https://search.patentsview.org/api/v1/patent/?q=${q}&f=patent_id,patent_title,patent_date,assignees.assignee_organization&per_page=${Math.min(limit, 50)}`;
        const data = await fetchJson<PatentsViewResponse>(url, 10000);
        const items = (data.patents || [])
          .map((patent): EvidenceItem | null => {
            const title = patent.patent_title;
            if (!title) return null;
            const matches = matchedKeywords(title, patentKeywords);
            if (!matches.length) return null;
            const capturedAt = new Date().toISOString();
            const patentId = patent.patent_id || title;
            return {
              id: stableId("patent", `${company.ticker}:${patentId}`),
              source: "patents" as const,
              provider: "PatentsView" as const,
              category: "patent" as const,
              companyId: company.id,
              ticker: company.ticker,
              title,
              url: patent.patent_id ? `https://patents.justia.com/patent/${patent.patent_id}` : undefined,
              publisher: patent.assignees?.map((assignee) => assignee.assignee_organization).filter(Boolean).join(", "),
              publishedAt: patent.patent_date,
              capturedAt,
              reliability: 0.78,
              confidence: confidenceFromMatches(matches, Boolean(patent.patent_id)),
              matchedKeywords: matches,
              tags: ["patent", ...matches],
              rawMetadata: patent as Record<string, unknown>
            } satisfies EvidenceItem;
          })
          .filter((item): item is EvidenceItem => Boolean(item));

        return {
          items,
          statuses: [sourceStatus("patents", "PatentsView", items.length ? "available" : "unavailable", items.length, "PatentsView evidence collection completed.", cacheTtlSeconds.patents)]
        };
      } catch (error) {
        const status = error instanceof ProviderError ? error.code : "error";
        return {
          items: [],
          statuses: [sourceStatus("patents", "PatentsView", status, 0, error instanceof Error ? error.message : "PatentsView request failed.", cacheTtlSeconds.patents)]
        };
      }
    });
  }
}

export const patentsService = new PatentsService();
