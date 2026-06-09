import type { CompanyProfile } from "@/lib/esg/types";

export const COMPANY_UNIVERSE: CompanyProfile[] = [
  { name: "DBS Group Holdings", ticker: "D05.SI", exchange: "SGX", country: "Singapore", sector: "Financial Services", beta: 0.9 },
  { name: "OCBC Bank", ticker: "O39.SI", exchange: "SGX", country: "Singapore", sector: "Financial Services", beta: 0.86 },
  { name: "Sea Limited", ticker: "SE", exchange: "NYSE", country: "Singapore", sector: "Technology", beta: 1.5 },
  { name: "Singtel", ticker: "Z74.SI", exchange: "SGX", country: "Singapore", sector: "Telecommunications", beta: 0.72 },
  { name: "CapitaLand Investment", ticker: "9CI.SI", exchange: "SGX", country: "Singapore", sector: "Real Estate", beta: 1.05 },
  { name: "Grab Holdings", ticker: "GRAB", exchange: "NASDAQ", country: "Singapore", sector: "Mobility and Fintech", beta: 1.25 },
  { name: "Toyota Motor", ticker: "TM", exchange: "NYSE", country: "Japan", sector: "Automotive", beta: 0.66 },
  { name: "Tesla", ticker: "TSLA", exchange: "NASDAQ", country: "United States", sector: "Automotive", beta: 2.2 },
  { name: "Microsoft", ticker: "MSFT", exchange: "NASDAQ", country: "United States", sector: "Technology", beta: 0.9 },
  { name: "NVIDIA", ticker: "NVDA", exchange: "NASDAQ", country: "United States", sector: "Semiconductors", beta: 1.7 },
  { name: "Unilever", ticker: "UL", exchange: "NYSE", country: "United Kingdom", sector: "Consumer Staples", beta: 0.42 },
  { name: "Shell", ticker: "SHEL", exchange: "NYSE", country: "United Kingdom", sector: "Energy", beta: 0.63 },
  { name: "TotalEnergies", ticker: "TTE", exchange: "NYSE", country: "France", sector: "Energy", beta: 0.74 },
  { name: "BYD", ticker: "1211.HK", exchange: "HKEX", country: "China", sector: "Automotive", beta: 1.2 },
  { name: "Samsung Electronics", ticker: "005930.KS", exchange: "KRX", country: "South Korea", sector: "Technology", beta: 1.0 }
];

export function fallbackCompany(query: string): CompanyProfile {
  const normalized = query.trim();
  const match = COMPANY_UNIVERSE.find((company) => {
    const haystack = `${company.name} ${company.ticker}`.toLowerCase();
    return haystack.includes(normalized.toLowerCase());
  });

  if (match) return match;
  return {
    name: normalized.toUpperCase(),
    ticker: normalized.toUpperCase(),
    exchange: "Live search",
    country: "Global",
    sector: "Public company",
    beta: 1
  };
}
