import type { CompanyProfile, CompanySearchResult, DynamicUniverse, SectorScanRequest } from "@/types";
import { stableId } from "@/utils/ids";
import { fmpCompanyProvider } from "./fmp-provider";
import { polygonCompanyProvider } from "./polygon-provider";
import type { CompanyProvider, UniverseProvider } from "./types";
import { yahooCompanyProvider } from "./yahoo-provider";

function mergeCompanies(results: CompanyProfile[]): CompanyProfile[] {
  const byTicker = new Map<string, CompanyProfile>();
  results.forEach((company) => {
    const key = company.ticker.toUpperCase();
    const existing = byTicker.get(key);
    if (!existing || (company.metadataConfidence || 0) > (existing.metadataConfidence || 0)) {
      byTicker.set(key, company);
    }
  });
  return Array.from(byTicker.values());
}

export class CompanyDiscoveryService {
  constructor(
    private readonly providers: CompanyProvider[] = [yahooCompanyProvider, fmpCompanyProvider, polygonCompanyProvider],
    private readonly universeProvider: UniverseProvider = yahooCompanyProvider
  ) {}

  async search(query: string, limit = 10): Promise<CompanySearchResult> {
    const providerResults = await Promise.all(this.providers.map((provider) => provider.search(query, limit)));
    const companies = mergeCompanies(providerResults.flatMap((result) => result.companies)).slice(0, limit);
    return {
      companies,
      status: companies.length ? "available" : "unavailable",
      providerStatuses: providerResults.map((result) => result.status)
    };
  }

  async metadata(ticker: string): Promise<{ company: CompanyProfile | null; statuses: CompanySearchResult["providerStatuses"] }> {
    const providerResults = await Promise.all(this.providers.map((provider) => provider.metadata(ticker)));
    const company = mergeCompanies(providerResults.flatMap((result) => (result.company ? [result.company] : [])))[0] || null;
    return {
      company,
      statuses: providerResults.map((result) => result.status)
    };
  }

  async generateUniverse(request: SectorScanRequest): Promise<DynamicUniverse> {
    const result = await this.universeProvider.generateUniverse(request);
    return {
      id: stableId("universe", JSON.stringify(request)),
      query: request,
      companies: result.companies.slice(0, request.limit || 50),
      statuses: result.statuses,
      generatedAt: new Date().toISOString()
    };
  }
}

export const companyDiscoveryService = new CompanyDiscoveryService();
