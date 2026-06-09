import { cacheTtlSeconds } from "@/config/cache";
import type { CompanyProfile, EvidenceSourceStatus } from "@/types";
import { cached } from "@/utils/cache";
import { sourceStatus } from "@/utils/evidence";
import { fetchJson, ProviderError } from "@/utils/http";
import { stableId } from "@/utils/ids";
import type { CompanyProvider } from "./types";

type PolygonTicker = {
  ticker?: string;
  name?: string;
  primary_exchange?: string;
  market?: string;
  currency_name?: string;
  locale?: string;
};

type PolygonSearchResponse = {
  results?: PolygonTicker[];
};

export class PolygonCompanyProvider implements CompanyProvider {
  readonly name = "Polygon" as const;

  async search(query: string, limit: number): Promise<{ companies: CompanyProfile[]; status: EvidenceSourceStatus }> {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      return { companies: [], status: sourceStatus("company", this.name, "missing_api_key", 0, "POLYGON_API_KEY is not configured.", cacheTtlSeconds.companySearch) };
    }

    return cached(`company:polygon:search:${query}:${limit}`, cacheTtlSeconds.companySearch, async () => {
      try {
        const params = new URLSearchParams({ search: query, active: "true", limit: String(limit), apiKey });
        const data = await fetchJson<PolygonSearchResponse>(`https://api.polygon.io/v3/reference/tickers?${params}`, 7000);
        const companies = (data.results || [])
          .filter((item) => item.ticker && item.name)
          .map((item) => ({
            id: stableId("company", String(item.ticker)),
            name: String(item.name),
            ticker: String(item.ticker),
            exchange: item.primary_exchange,
            country: item.locale,
            currency: item.currency_name,
            dataProvider: this.name,
            lastUpdated: new Date().toISOString(),
            searchAliases: [String(item.ticker), String(item.name)],
            metadataConfidence: 0.76
          }));
        return { companies, status: sourceStatus("company", this.name, companies.length ? "available" : "unavailable", companies.length, "Polygon search completed.", cacheTtlSeconds.companySearch) };
      } catch (error) {
        const status = error instanceof ProviderError ? error.code : "error";
        return { companies: [], status: sourceStatus("company", this.name, status, 0, error instanceof Error ? error.message : "Polygon search failed.", cacheTtlSeconds.companySearch) };
      }
    });
  }

  async metadata(ticker: string): Promise<{ company: CompanyProfile | null; status: EvidenceSourceStatus }> {
    const result = await this.search(ticker, 1);
    return { company: result.companies[0] || null, status: result.status };
  }
}

export const polygonCompanyProvider = new PolygonCompanyProvider();
