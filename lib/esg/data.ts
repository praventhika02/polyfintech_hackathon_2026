import { buildAnalysis, classifyCategory, riskType, scoreTone } from "@/lib/esg/scoring";
import type { CompanySeed, ESGAnalysis, MarketSnapshot, NewsArticle } from "@/lib/esg/types";
import { COMPANY_UNIVERSE, findCompany } from "@/lib/esg/universe";

const cache = new Map<string, { time: number; value: unknown }>();

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < ttlMs) return hit.value as T;
  const value = await fn();
  cache.set(key, { time: Date.now(), value });
  return value;
}

async function fetchJson(url: string, timeoutMs = 7500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 300 },
      headers: {
        "user-agent": "ESG-Alpha-Hackathon/1.0",
        accept: "application/json,text/plain,*/*"
      }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

function gdeltUrl(company: CompanySeed, maxrecords = 18) {
  const query = `"${company.name}" (sustainability OR ESG OR climate OR governance OR renewable OR carbon OR labor OR emissions OR transition)`;
  const params = new URLSearchParams({
    query,
    mode: "artlist",
    format: "json",
    sort: "datedesc",
    maxrecords: String(maxrecords)
  });
  return `https://api.gdeltproject.org/api/v2/doc/doc?${params}`;
}

export async function fetchNews(company: CompanySeed): Promise<NewsArticle[]> {
  return cached(`news:${company.ticker}`, 1000 * 60 * 8, async () => {
    try {
      const data = await fetchJson(gdeltUrl(company));
      return (data.articles || []).slice(0, 16).map((article: Record<string, string>) => {
        const title = article.title || `${company.name} ESG update`;
        return {
          title,
          url: article.url || "#",
          source: article.sourcecountry || article.domain || "GDELT",
          domain: article.domain,
          seenDate: article.seendate,
          tone: scoreTone(title),
          category: classifyCategory(title),
          riskType: riskType(title)
        };
      });
    } catch {
      return [];
    }
  });
}

export async function fetchMarket(company: CompanySeed): Promise<MarketSnapshot | null> {
  return cached(`market:${company.ticker}`, 1000 * 60 * 8, async () => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(company.ticker)}?range=3mo&interval=1d`;
      const data = await fetchJson(url);
      const result = data.chart?.result?.[0];
      const quote = result?.indicators?.quote?.[0] || {};
      const closes = (quote.close || []).filter((value: number) => Number.isFinite(value));
      const last = closes.at(-1) || 0;
      const first = closes.find((value: number) => value > 0) || last || 1;
      const change = first ? ((last - first) / first) * 100 : 0;
      return {
        ticker: company.ticker,
        price: Number(last.toFixed(3)),
        currency: result?.meta?.currency || "",
        change3m: Number(change.toFixed(2)),
        source: "Yahoo Finance chart"
      };
    } catch {
      return null;
    }
  });
}

export async function analyzeCompany(query: string): Promise<ESGAnalysis> {
  const company = findCompany(query);
  const [news, market] = await Promise.all([fetchNews(company), fetchMarket(company)]);
  return buildAnalysis(company, news, market);
}

export async function analyzeUniverse(limit = 10) {
  return cached(`universe:${limit}`, 1000 * 60 * 8, async () => {
    const results = await Promise.allSettled(COMPANY_UNIVERSE.slice(0, limit).map((company) => analyzeCompany(company.ticker)));
    return results
      .filter((result): result is PromiseFulfilledResult<ESGAnalysis> => result.status === "fulfilled")
      .map((result) => result.value)
      .sort((a, b) => b.momentumScore - a.momentumScore || b.confidenceScore - a.confidenceScore);
  });
}
