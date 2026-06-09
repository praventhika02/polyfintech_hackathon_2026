import { fetchJobSignal, fetchMarket, fetchNews, fetchPatentSignal, resolveCompany } from "@/lib/esg/connectors";
import { buildAnalysis } from "@/lib/esg/scoring";
import type { ESGAnalysis } from "@/lib/esg/types";
import { COMPANY_UNIVERSE } from "@/lib/esg/universe";

export async function analyzeCompany(query: string): Promise<ESGAnalysis> {
  const company = await resolveCompany(query);
  const [news, market, jobSignal, patentSignal] = await Promise.all([
    fetchNews(company),
    fetchMarket(company),
    fetchJobSignal(company),
    fetchPatentSignal(company)
  ]);
  return buildAnalysis(company, news, market, jobSignal, patentSignal);
}

export async function analyzeUniverse(limit = 10): Promise<ESGAnalysis[]> {
  const companies = COMPANY_UNIVERSE.slice(0, limit);
  const results = await Promise.allSettled(companies.map((company) => analyzeCompany(company.ticker)));
  return results
    .filter((result): result is PromiseFulfilledResult<ESGAnalysis> => result.status === "fulfilled")
    .map((result) => result.value);
}

export async function hiddenWinners(limit = 12) {
  const results = await analyzeUniverse(limit);
  return results
    .filter((company) => company.currentScore < 72 && company.momentumScore > 2)
    .sort((a, b) => b.momentumScore - a.momentumScore || b.confidenceScore - a.confidenceScore);
}

export async function earlyWarnings(limit = 12) {
  const results = await analyzeUniverse(limit);
  return results
    .filter((company) => company.momentumScore < 1 || company.risks.length > 0)
    .sort((a, b) => a.momentumScore - b.momentumScore || b.risks.length - a.risks.length);
}
