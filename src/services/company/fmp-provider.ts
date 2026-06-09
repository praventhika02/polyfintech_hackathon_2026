import { cacheTtlSeconds } from "@/config/cache";
import type { CompanyProfile, EvidenceSourceStatus } from "@/types";
import { cached } from "@/utils/cache";
import { sourceStatus } from "@/utils/evidence";
import { fetchJson, ProviderError } from "@/utils/http";
import { stableId } from "@/utils/ids";
import type { CompanyProvider } from "./types";

type FmpSearchItem = {
  symbol?: string;
  name?: string;
  exchangeShortName?: string;
  stockExchange?: string;
  currency?: string;
};

export class FmpCompanyProvider implements CompanyProvider {
  readonly name = "Financial Modeling Prep" as const;

  async search(query: string, limit: number): Promise<{ companies: CompanyProfile[]; status: EvidenceSourceStatus }> {
    const apiKey = process.env.FMP_API_KEY;
    if (!apiKey) {
      return { companies: [], status: sourceStatus("company", this.name, "missing_api_key", 0, "FMP_API_KEY is not configured.", cacheTtlSeconds.companySearch) };
    }

    return cached(`company:fmp:search:${query}:${limit}`, cacheTtlSeconds.companySearch, async () => {
      try {
        const params = new URLSearchParams({ query, limit: String(limit), apikey: apiKey });
        const data = await fetchJson<FmpSearchItem[]>(`https://financialmodelingprep.com/api/v3/search?${params}`, 7000);
        const companies = data
          .filter((item) => item.symbol && item.name)
          .map((item) => ({
            id: stableId("company", String(item.symbol)),
            name: String(item.name),
            ticker: String(item.symbol),
            exchange: item.exchangeShortName || item.stockExchange,
            currency: item.currency,
            dataProvider: this.name,
            lastUpdated: new Date().toISOString(),
            searchAliases: [String(item.symbol), String(item.name)],
            metadataConfidence: 0.74
          }));
        return { companies, status: sourceStatus("company", this.name, companies.length ? "available" : "unavailable", companies.length, "FMP search completed.", cacheTtlSeconds.companySearch) };
      } catch (error) {
        const status = error instanceof ProviderError ? error.code : "error";
        return { companies: [], status: sourceStatus("company", this.name, status, 0, error instanceof Error ? error.message : "FMP search failed.", cacheTtlSeconds.companySearch) };
      }
    });
  }

  async metadata(ticker: string): Promise<{ company: CompanyProfile | null; status: EvidenceSourceStatus }> {
    const result = await this.search(ticker, 1);
    return { company: result.companies[0] || null, status: result.status };
  }
}

export const fmpCompanyProvider = new FmpCompanyProvider();
