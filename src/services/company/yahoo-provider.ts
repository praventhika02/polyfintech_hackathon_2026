import { cacheTtlSeconds } from "@/config/cache";
import type { CompanyProfile, EvidenceSourceStatus, SectorScanRequest } from "@/types";
import { cached } from "@/utils/cache";
import { sourceStatus } from "@/utils/evidence";
import { fetchJson, ProviderError } from "@/utils/http";
import { stableId } from "@/utils/ids";
import { resolveTickerAlias } from "./aliases";
import type { CompanyProvider, UniverseProvider } from "./types";

type YahooSearchQuote = {
  symbol?: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
  exchange?: string;
  exchDisp?: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  region?: string;
};

type YahooSearchResponse = {
  quotes?: YahooSearchQuote[];
};

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string;
        longName?: string;
        shortName?: string;
        exchangeName?: string;
        fullExchangeName?: string;
        currency?: string;
        regularMarketPrice?: number;
      };
    }>;
  };
};

function toCompany(quote: YahooSearchQuote): CompanyProfile | null {
  const ticker = quote.symbol;
  const name = quote.longname || quote.shortname || quote.symbol;
  if (!ticker || !name) return null;

  return {
    id: stableId("company", ticker),
    name,
    ticker,
    exchange: quote.exchange || quote.exchDisp,
    country: quote.region,
    sector: quote.sector,
    industry: quote.industry,
    marketCap: quote.marketCap,
    dataProvider: "Yahoo Finance",
    lastUpdated: new Date().toISOString(),
    searchAliases: [ticker, name],
    metadataConfidence: quote.longname ? 0.78 : 0.58
  };
}

export class YahooCompanyProvider implements CompanyProvider, UniverseProvider {
  readonly name = "Yahoo Finance" as const;

  async search(query: string, limit: number): Promise<{ companies: CompanyProfile[]; status: EvidenceSourceStatus }> {
    const normalizedQuery = resolveTickerAlias(query);
    if (!normalizedQuery || normalizedQuery.length < 1) {
      return {
        companies: [],
        status: sourceStatus("company", this.name, "unavailable", 0, "Search query is empty.", cacheTtlSeconds.companySearch)
      };
    }

    return cached(`company:yahoo:search:${normalizedQuery}:${limit}`, cacheTtlSeconds.companySearch, async () => {
      try {
        const params = new URLSearchParams({
          q: normalizedQuery,
          quotesCount: String(limit),
          newsCount: "0",
          listsCount: "0"
        });
        const data = await fetchJson<YahooSearchResponse>(`https://query1.finance.yahoo.com/v1/finance/search?${params}`, 7000);
        const companies = (data.quotes || [])
          .filter((quote) => ["EQUITY", "ETF"].includes(String(quote.quoteType || "")))
          .map(toCompany)
          .filter((company): company is CompanyProfile => Boolean(company))
          .slice(0, limit);

        return {
          companies,
          status: sourceStatus(
            "company",
            this.name,
            companies.length ? "available" : "unavailable",
            companies.length,
            companies.length ? "Company search completed." : "No matching public companies returned by provider.",
            cacheTtlSeconds.companySearch
          )
        };
      } catch (error) {
        const status = error instanceof ProviderError ? error.code : "error";
        return {
          companies: [],
          status: sourceStatus("company", this.name, status, 0, error instanceof Error ? error.message : "Company search failed.", cacheTtlSeconds.companySearch)
        };
      }
    });
  }

  async metadata(ticker: string): Promise<{ company: CompanyProfile | null; status: EvidenceSourceStatus }> {
    const symbol = resolveTickerAlias(ticker).toUpperCase();
    return cached(`company:yahoo:metadata:${symbol}`, cacheTtlSeconds.companyMetadata, async () => {
      try {
        const data = await fetchJson<YahooChartResponse>(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`, 7000);
        const meta = data.chart?.result?.[0]?.meta;
        if (!meta?.symbol) {
          return {
            company: null,
            status: sourceStatus("company", this.name, "unavailable", 0, "Ticker was not found by provider.", cacheTtlSeconds.companyMetadata)
          };
        }

        const company: CompanyProfile = {
          id: stableId("company", meta.symbol),
          name: meta.longName || meta.shortName || meta.symbol,
          ticker: meta.symbol,
          exchange: meta.fullExchangeName || meta.exchangeName,
          currency: meta.currency,
          dataProvider: this.name,
          lastUpdated: new Date().toISOString(),
          searchAliases: [meta.symbol, meta.longName || meta.shortName || meta.symbol],
          metadataConfidence: meta.longName ? 0.72 : 0.52
        };

        return {
          company,
          status: sourceStatus("company", this.name, "available", 1, "Company metadata collected.", cacheTtlSeconds.companyMetadata)
        };
      } catch (error) {
        const status = error instanceof ProviderError ? error.code : "error";
        return {
          company: null,
          status: sourceStatus("company", this.name, status, 0, error instanceof Error ? error.message : "Company metadata failed.", cacheTtlSeconds.companyMetadata)
        };
      }
    });
  }

  async generateUniverse(request: SectorScanRequest): Promise<{ companies: CompanyProfile[]; statuses: EvidenceSourceStatus[] }> {
    const queries = [
      request.query,
      request.sectors?.join(" "),
      request.exchange,
      request.region,
      "public company"
    ].filter((value): value is string => Boolean(value && value.trim()));
    const query = queries.join(" ");
    const result = await this.search(query, request.limit || 50);
    return {
      companies: result.companies,
      statuses: [result.status]
    };
  }
}

export const yahooCompanyProvider = new YahooCompanyProvider();
