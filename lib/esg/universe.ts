import type { CompanySeed } from "@/lib/esg/types";

export const COMPANY_UNIVERSE: CompanySeed[] = [
  { id: "DBS", name: "DBS Group", ticker: "D05.SI", region: "ASEAN", sector: "Banking", country: "Singapore", beta: 0.82 },
  { id: "OCBC", name: "OCBC Bank", ticker: "O39.SI", region: "ASEAN", sector: "Banking", country: "Singapore", beta: 0.77 },
  { id: "UOB", name: "United Overseas Bank", ticker: "U11.SI", region: "ASEAN", sector: "Banking", country: "Singapore", beta: 0.79 },
  { id: "GRAB", name: "Grab Holdings", ticker: "GRAB", region: "ASEAN", sector: "Mobility", country: "Singapore", beta: 1.34 },
  { id: "SE", name: "Sea Limited", ticker: "SE", region: "ASEAN", sector: "Technology", country: "Singapore", beta: 1.58 },
  { id: "Singtel", name: "Singtel", ticker: "Z74.SI", region: "ASEAN", sector: "Telecom", country: "Singapore", beta: 0.72 },
  { id: "Wilmar", name: "Wilmar International", ticker: "F34.SI", region: "ASEAN", sector: "Food & Agriculture", country: "Singapore", beta: 0.95 },
  { id: "Keppel", name: "Keppel", ticker: "BN4.SI", region: "ASEAN", sector: "Infrastructure", country: "Singapore", beta: 1.02 },
  { id: "AIA", name: "AIA Group", ticker: "1299.HK", region: "Asia", sector: "Insurance", country: "Hong Kong", beta: 0.86 },
  { id: "TSLA", name: "Tesla", ticker: "TSLA", region: "US", sector: "Automotive", country: "United States", beta: 1.8 },
  { id: "MSFT", name: "Microsoft", ticker: "MSFT", region: "US", sector: "Technology", country: "United States", beta: 0.92 },
  { id: "NVDA", name: "NVIDIA", ticker: "NVDA", region: "US", sector: "Semiconductors", country: "United States", beta: 1.7 },
  { id: "AAPL", name: "Apple", ticker: "AAPL", region: "US", sector: "Technology", country: "United States", beta: 1.16 },
  { id: "TM", name: "Toyota Motor", ticker: "TM", region: "Asia", sector: "Automotive", country: "Japan", beta: 0.62 },
  { id: "ASML", name: "ASML Holding", ticker: "ASML", region: "Europe", sector: "Semiconductors", country: "Netherlands", beta: 1.1 },
  { id: "0700.HK", name: "Tencent", ticker: "0700.HK", region: "Asia", sector: "Technology", country: "China", beta: 1.12 }
];

export function findCompany(query: string): CompanySeed {
  const normalized = query.trim().toLowerCase();
  const match = COMPANY_UNIVERSE.find((company) =>
    company.ticker.toLowerCase() === normalized ||
    company.id.toLowerCase() === normalized ||
    company.name.toLowerCase().includes(normalized)
  );

  if (match) return match;

  const ticker = query.trim().toUpperCase().replace(/[^A-Z0-9.-]/g, "");
  return {
    id: ticker || "CUSTOM",
    name: ticker || query.trim(),
    ticker: ticker || query.trim(),
    region: "Global",
    sector: "Unclassified",
    country: "Unknown",
    beta: 1
  };
}

export function searchCompanies(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return COMPANY_UNIVERSE.slice(0, 8);

  return COMPANY_UNIVERSE.filter((company) =>
    [company.name, company.ticker, company.region, company.sector, company.country]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  ).slice(0, 12);
}
