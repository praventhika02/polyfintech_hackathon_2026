import { cacheTtlSeconds } from "@/config/cache";
import type { CompanyProfile, EvidenceItem, EvidenceSourceStatus, MarketTrend } from "@/types";
import { cached } from "@/utils/cache";
import { sourceStatus } from "@/utils/evidence";
import { fetchJson, ProviderError } from "@/utils/http";
import { stableId } from "@/utils/ids";

type YahooRange = "3mo" | "6mo" | "1y";

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string;
        currency?: string;
      };
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
  };
};

function performance(closes: number[]): number | undefined {
  const first = closes[0];
  const last = closes.at(-1);
  if (!first || !last) return undefined;
  return Number((((last - first) / first) * 100).toFixed(2));
}

function volatility(closes: number[]): number | undefined {
  if (closes.length < 3) return undefined;
  const returns = closes.slice(1).map((close, index) => (close - closes[index]) / closes[index]);
  const average = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance = returns.reduce((sum, value) => sum + (value - average) ** 2, 0) / returns.length;
  return Number((Math.sqrt(variance) * Math.sqrt(252) * 100).toFixed(2));
}

async function fetchCloses(ticker: string, range: YahooRange): Promise<number[]> {
  const data = await fetchJson<YahooChartResponse>(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=1d`, 9000);
  return (data.chart?.result?.[0]?.indicators?.quote?.[0]?.close || []).filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);
}

export class FinanceService {
  async getMarketEvidence(company: CompanyProfile): Promise<{ trend: MarketTrend | null; items: EvidenceItem[]; statuses: EvidenceSourceStatus[] }> {
    return cached(`market:yahoo:${company.ticker}`, cacheTtlSeconds.market, async () => {
      try {
        const [threeMonth, sixMonth, oneYear] = await Promise.all([fetchCloses(company.ticker, "3mo"), fetchCloses(company.ticker, "6mo"), fetchCloses(company.ticker, "1y")]);
        const performance3m = performance(threeMonth);
        const performance6m = performance(sixMonth);
        const performance12m = performance(oneYear);
        const trendDirection = performance3m === undefined ? "unavailable" : performance3m > 2 ? "up" : performance3m < -2 ? "down" : "flat";
        const capturedAt = new Date().toISOString();
        const trend: MarketTrend = {
          ticker: company.ticker,
          provider: "Yahoo Finance",
          performance3m,
          performance6m,
          performance12m,
          volatility: volatility(oneYear),
          sector: company.sector,
          industry: company.industry,
          trendDirection,
          capturedAt
        };
        const item: EvidenceItem = {
          id: stableId("market", `${company.ticker}:${capturedAt}`),
          source: "finance",
          provider: "Yahoo Finance",
          category: "market",
          companyId: company.id,
          ticker: company.ticker,
          title: `Market trend evidence for ${company.ticker}`,
          description: "Yahoo Finance market performance. This is market intelligence, not ESG scoring.",
          capturedAt,
          reliability: 0.82,
          confidence: trendDirection === "unavailable" ? "unavailable" : "medium",
          matchedKeywords: [],
          tags: ["market", "not-esg"],
          rawMetadata: trend
        };

        return {
          trend,
          items: [item],
          statuses: [sourceStatus("finance", "Yahoo Finance", "available", 1, "Yahoo Finance market trend collected.", cacheTtlSeconds.market)]
        };
      } catch (error) {
        const status = error instanceof ProviderError ? error.code : "error";
        return {
          trend: null,
          items: [],
          statuses: [sourceStatus("finance", "Yahoo Finance", status, 0, error instanceof Error ? error.message : "Yahoo Finance market request failed.", cacheTtlSeconds.market)]
        };
      }
    });
  }
}

export const financeService = new FinanceService();
