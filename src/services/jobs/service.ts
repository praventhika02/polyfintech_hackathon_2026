import { cacheTtlSeconds } from "@/config/cache";
import { jobKeywords } from "@/config/keywords";
import type { CompanyProfile, EvidenceItem, EvidenceSourceStatus } from "@/types";
import { cached } from "@/utils/cache";
import { confidenceFromMatches, matchedKeywords, sourceStatus } from "@/utils/evidence";
import { fetchJson, ProviderError } from "@/utils/http";
import { stableId } from "@/utils/ids";

type AdzunaJob = {
  title?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  created?: string;
  redirect_url?: string;
  description?: string;
};

type AdzunaResponse = {
  results?: AdzunaJob[];
  count?: number;
};

export class JobsService {
  async getJobEvidence(company: CompanyProfile, limit = 20): Promise<{ items: EvidenceItem[]; statuses: EvidenceSourceStatus[] }> {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    if (!appId || !appKey) {
      return {
        items: [],
        statuses: [sourceStatus("jobs", "Adzuna", "missing_api_key", 0, "ADZUNA_APP_ID or ADZUNA_APP_KEY is not configured.", cacheTtlSeconds.jobs)]
      };
    }

    return cached(`jobs:adzuna:${company.ticker}:${limit}`, cacheTtlSeconds.jobs, async () => {
      try {
        const params = new URLSearchParams({
          app_id: appId,
          app_key: appKey,
          what: `${company.name} ${jobKeywords.join(" OR ")}`,
          results_per_page: String(Math.min(limit, 50)),
          content_type: "application/json"
        });
        const data = await fetchJson<AdzunaResponse>(`https://api.adzuna.com/v1/api/jobs/us/search/1?${params}`, 9000);
        const items = (data.results || [])
          .map((job): EvidenceItem | null => {
            const title = job.title;
            const text = `${job.title || ""} ${job.description || ""}`;
            const matches = matchedKeywords(text, jobKeywords);
            if (!title || !matches.length) return null;
            const capturedAt = new Date().toISOString();
            return {
              id: stableId("job", `${company.ticker}:${title}:${job.created || capturedAt}`),
              source: "jobs" as const,
              provider: "Adzuna" as const,
              category: "job" as const,
              companyId: company.id,
              ticker: company.ticker,
              title,
              description: job.description,
              url: job.redirect_url,
              publisher: job.company?.display_name,
              publishedAt: job.created,
              capturedAt,
              excerpt: job.description?.slice(0, 280),
              reliability: 0.72,
              confidence: confidenceFromMatches(matches, Boolean(job.redirect_url)),
              matchedKeywords: matches,
              tags: ["job", ...matches],
              rawMetadata: job as Record<string, unknown>
            } satisfies EvidenceItem;
          })
          .filter((item): item is EvidenceItem => Boolean(item));

        return {
          items,
          statuses: [sourceStatus("jobs", "Adzuna", items.length ? "available" : "unavailable", items.length, "Adzuna job evidence collection completed.", cacheTtlSeconds.jobs)]
        };
      } catch (error) {
        const status = error instanceof ProviderError ? error.code : "error";
        return {
          items: [],
          statuses: [sourceStatus("jobs", "Adzuna", status, 0, error instanceof Error ? error.message : "Adzuna request failed.", cacheTtlSeconds.jobs)]
        };
      }
    });
  }
}

export const jobsService = new JobsService();
