import { cacheTtlSeconds } from "@/config/cache";
import { newsKeywords } from "@/config/keywords";
import type { CompanyProfile, EvidenceItem, EvidenceSourceStatus } from "@/types";
import { cached } from "@/utils/cache";
import { confidenceFromMatches, matchedKeywords, sourceStatus } from "@/utils/evidence";
import { fetchJson, ProviderError } from "@/utils/http";
import { stableId } from "@/utils/ids";

type NewsProviderResult = {
  items: EvidenceItem[];
  status: EvidenceSourceStatus;
};

type NewsApiArticle = {
  title?: string;
  description?: string;
  url?: string;
  publishedAt?: string;
  source?: { name?: string };
};

type NewsApiResponse = {
  articles?: NewsApiArticle[];
};

type GNewsArticle = {
  title?: string;
  description?: string;
  url?: string;
  publishedAt?: string;
  source?: { name?: string };
};

type GNewsResponse = {
  articles?: GNewsArticle[];
};

type GdeltArticle = {
  title?: string;
  url?: string;
  domain?: string;
  seendate?: string;
  sourcecountry?: string;
  language?: string;
};

type GdeltResponse = {
  articles?: GdeltArticle[];
};

function queryForCompany(company: CompanyProfile): string {
  const terms = newsKeywords.map((keyword) => `"${keyword}"`).join(" OR ");
  return `("${company.name}" OR "${company.ticker}") (${terms})`;
}

function normalizeNewsArticle(
  provider: "NewsAPI" | "GNews" | "GDELT",
  company: CompanyProfile,
  article: {
    title?: string;
    description?: string;
    url?: string;
    publishedAt?: string;
    sourceName?: string;
    language?: string;
    raw: Record<string, unknown>;
  }
): EvidenceItem | null {
  if (!article.title && !article.description) return null;
  const text = `${article.title || ""} ${article.description || ""}`;
  const matches = matchedKeywords(text, newsKeywords);
  if (!matches.length) return null;
  const title = article.title || article.description || "Untitled news evidence";
  const capturedAt = new Date().toISOString();

  return {
    id: stableId("news", `${provider}:${company.ticker}:${title}:${article.publishedAt || capturedAt}`),
    source: "news",
    provider,
    category: "news",
    companyId: company.id,
    ticker: company.ticker,
    title,
    description: article.description,
    url: article.url,
    publisher: article.sourceName,
    publishedAt: article.publishedAt,
    capturedAt,
    excerpt: article.description,
    reliability: provider === "NewsAPI" ? 0.86 : provider === "GNews" ? 0.8 : 0.68,
    confidence: confidenceFromMatches(matches, Boolean(article.url)),
    matchedKeywords: matches,
    language: article.language,
    tags: ["news", ...matches],
    rawMetadata: article.raw
  };
}

export async function fetchNewsApiEvidence(company: CompanyProfile, limit: number): Promise<NewsProviderResult> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    return { items: [], status: sourceStatus("news", "NewsAPI", "missing_api_key", 0, "NEWSAPI_KEY is not configured.", cacheTtlSeconds.news) };
  }

  return cached(`news:newsapi:${company.ticker}:${limit}`, cacheTtlSeconds.news, async () => {
    try {
      const params = new URLSearchParams({
        q: queryForCompany(company),
        language: "en",
        pageSize: String(limit),
        sortBy: "publishedAt",
        apiKey
      });
      const data = await fetchJson<NewsApiResponse>(`https://newsapi.org/v2/everything?${params}`, 9000);
      const items = (data.articles || [])
        .map((article) =>
          normalizeNewsArticle("NewsAPI", company, {
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: article.publishedAt,
            sourceName: article.source?.name,
            raw: article as Record<string, unknown>
          })
        )
        .filter((item): item is EvidenceItem => Boolean(item));
      return { items, status: sourceStatus("news", "NewsAPI", items.length ? "available" : "unavailable", items.length, "NewsAPI evidence collection completed.", cacheTtlSeconds.news) };
    } catch (error) {
      const status = error instanceof ProviderError ? error.code : "error";
      return { items: [], status: sourceStatus("news", "NewsAPI", status, 0, error instanceof Error ? error.message : "NewsAPI request failed.", cacheTtlSeconds.news) };
    }
  });
}

export async function fetchGNewsEvidence(company: CompanyProfile, limit: number): Promise<NewsProviderResult> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    return { items: [], status: sourceStatus("news", "GNews", "missing_api_key", 0, "GNEWS_API_KEY is not configured.", cacheTtlSeconds.news) };
  }

  return cached(`news:gnews:${company.ticker}:${limit}`, cacheTtlSeconds.news, async () => {
    try {
      const params = new URLSearchParams({
        q: queryForCompany(company),
        lang: "en",
        max: String(Math.min(limit, 10)),
        apikey: apiKey
      });
      const data = await fetchJson<GNewsResponse>(`https://gnews.io/api/v4/search?${params}`, 9000);
      const items = (data.articles || [])
        .map((article) =>
          normalizeNewsArticle("GNews", company, {
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: article.publishedAt,
            sourceName: article.source?.name,
            raw: article as Record<string, unknown>
          })
        )
        .filter((item): item is EvidenceItem => Boolean(item));
      return { items, status: sourceStatus("news", "GNews", items.length ? "available" : "unavailable", items.length, "GNews evidence collection completed.", cacheTtlSeconds.news) };
    } catch (error) {
      const status = error instanceof ProviderError ? error.code : "error";
      return { items: [], status: sourceStatus("news", "GNews", status, 0, error instanceof Error ? error.message : "GNews request failed.", cacheTtlSeconds.news) };
    }
  });
}

export async function fetchGdeltEvidence(company: CompanyProfile, limit: number): Promise<NewsProviderResult> {
  return cached(`news:gdelt:${company.ticker}:${limit}`, cacheTtlSeconds.news, async () => {
    try {
      const params = new URLSearchParams({
        query: queryForCompany(company),
        mode: "artlist",
        format: "json",
        sort: "datedesc",
        maxrecords: String(Math.min(limit, 50))
      });
      const data = await fetchJson<GdeltResponse>(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`, 10000);
      const items = (data.articles || [])
        .map((article) =>
          normalizeNewsArticle("GDELT", company, {
            title: article.title,
            url: article.url,
            publishedAt: article.seendate,
            sourceName: article.domain || article.sourcecountry,
            language: article.language,
            raw: article as Record<string, unknown>
          })
        )
        .filter((item): item is EvidenceItem => Boolean(item));
      return { items, status: sourceStatus("news", "GDELT", items.length ? "available" : "unavailable", items.length, "GDELT evidence collection completed.", cacheTtlSeconds.news) };
    } catch (error) {
      const status = error instanceof ProviderError ? error.code : "error";
      return { items: [], status: sourceStatus("news", "GDELT", status, 0, error instanceof Error ? error.message : "GDELT request failed.", cacheTtlSeconds.news) };
    }
  });
}
