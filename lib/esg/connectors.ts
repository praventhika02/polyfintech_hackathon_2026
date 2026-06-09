import { esgTerms, greenPatentTerms } from "@/lib/esg/config";
import type { CompanyProfile, JobSignal, MarketSnapshot, NewsArticle, PatentSignal } from "@/lib/esg/types";
import { classifyCategory, riskType, scoreTone, sentimentFromTone } from "@/lib/esg/scoring";
import { fallbackCompany } from "@/lib/esg/universe";

const cache = new Map<string, { expires: number; value: unknown }>();

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await fn();
  cache.set(key, { expires: Date.now() + ttlMs, value });
  return value;
}

async function fetchJson(url: string, timeoutMs = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 300 },
      headers: { accept: "application/json,text/plain,*/*", "user-agent": "ESG-Alpha-Digital-Twin/1.0" }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export async function searchCompanies(query: string): Promise<CompanyProfile[]> {
  const q = query.trim();
  if (!q) return [];

  return cached(`search:${q.toLowerCase()}`, 1000 * 60 * 10, async () => {
    try {
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`;
      const data = await fetchJson(url);
      const quotes = Array.isArray(data.quotes) ? data.quotes : [];
      const companies = quotes
        .filter((quote: Record<string, unknown>) => quote.symbol && quote.shortname)
        .slice(0, 8)
        .map((quote: Record<string, unknown>) => ({
          name: String(quote.shortname || quote.longname || quote.symbol),
          ticker: String(quote.symbol),
          exchange: String(quote.exchange || quote.exchDisp || "Yahoo Finance"),
          country: String(quote.region || "Global"),
          sector: String(quote.sector || quote.industry || "Public company"),
          marketCap: asNumber(quote.marketCap),
          beta: 1
        }));
      return companies.length ? companies : [fallbackCompany(q)];
    } catch {
      return [fallbackCompany(q)];
    }
  });
}

export async function resolveCompany(query: string): Promise<CompanyProfile> {
  const companies = await searchCompanies(query);
  return companies[0] || fallbackCompany(query);
}

export async function fetchNews(company: CompanyProfile): Promise<NewsArticle[]> {
  return cached(`news:${company.ticker}`, 1000 * 60 * 8, async () => {
    const terms = esgTerms.join(" OR ");
    const gdeltQuery = `"${company.name}" (${terms})`;
    const params = new URLSearchParams({
      query: gdeltQuery,
      mode: "artlist",
      format: "json",
      sort: "datedesc",
      maxrecords: "20"
    });

    try {
      const data = await fetchJson(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`);
      const articles = Array.isArray(data.articles) ? data.articles : [];
      return articles.slice(0, 16).map((article: Record<string, string>) => {
        const title = article.title || `${company.name} ESG update`;
        const tone = scoreTone(title);
        return {
          title,
          url: article.url || "#",
          source: article.domain || article.sourcecountry || "GDELT",
          publishedAt: article.seendate,
          tone,
          sentiment: sentimentFromTone(tone),
          category: classifyCategory(title),
          riskType: riskType(title) || undefined
        };
      });
    } catch {
      return [];
    }
  });
}

export async function fetchMarket(company: CompanyProfile): Promise<MarketSnapshot | null> {
  return cached(`market:${company.ticker}`, 1000 * 60 * 8, async () => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(company.ticker)}?range=3mo&interval=1d`;
      const data = await fetchJson(url);
      const result = data.chart?.result?.[0];
      const quote = result?.indicators?.quote?.[0] || {};
      const closes = (quote.close || []).filter((value: number) => Number.isFinite(value) && value > 0);
      const first = closes[0];
      const last = closes.at(-1);
      if (!first || !last) return null;
      return {
        price: Number(last.toFixed(3)),
        currency: result?.meta?.currency || "",
        change3m: Number((((last - first) / first) * 100).toFixed(2)),
        source: "Yahoo Finance"
      };
    } catch {
      return null;
    }
  });
}

export async function fetchJobSignal(company: CompanyProfile): Promise<JobSignal> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    return {
      available: false,
      score: 45,
      count: 0,
      source: "Adzuna API",
      reason: "Adzuna credentials are not configured, so hiring confidence is reduced."
    };
  }

  return cached(`jobs:${company.ticker}`, 1000 * 60 * 30, async () => {
    try {
      const query = `${company.name} sustainability OR ESG OR climate`;
      const params = new URLSearchParams({
        app_id: appId,
        app_key: appKey,
        what: query,
        results_per_page: "20",
        content_type: "application/json"
      });
      const data = await fetchJson(`https://api.adzuna.com/v1/api/jobs/us/search/1?${params}`);
      const count = Number(data.count || 0);
      return {
        available: true,
        score: Math.max(35, Math.min(96, 45 + Math.log10(count + 1) * 18)),
        count,
        source: "Adzuna API",
        reason: count ? `${count} sustainability-adjacent postings found.` : "No matching sustainability hiring signal found."
      };
    } catch {
      return { available: false, score: 45, count: 0, source: "Adzuna API", reason: "Job API request failed." };
    }
  });
}

export async function fetchPatentSignal(company: CompanyProfile): Promise<PatentSignal> {
  return cached(`patents:${company.ticker}`, 1000 * 60 * 60, async () => {
    try {
      const text = greenPatentTerms.map((term) => `"${term}"`).join(" OR ");
      const q = encodeURIComponent(`assignee_organization:${company.name} AND (${text})`);
      const url = `https://search.patentsview.org/api/v1/patent/?q=${q}&f=patent_id,patent_title&per_page=20`;
      const data = await fetchJson(url);
      const count = Number(data.total_patent_count || data.count || 0);
      return {
        available: true,
        score: Math.max(38, Math.min(96, 44 + Math.log10(count + 1) * 20)),
        count,
        source: "PatentsView",
        reason: count ? `${count} green-innovation patent matches found.` : "No green patent matches were found."
      };
    } catch {
      return {
        available: false,
        score: 45,
        count: 0,
        source: "PatentsView",
        reason: "Patent signal unavailable. Add PATENTSVIEW_API_KEY if your endpoint requires one."
      };
    }
  });
}
