const tickerAliases: Record<string, string> = {
  DBS: "D05.SI",
  OCBC: "O39.SI",
  UOB: "U11.SI"
};

export function resolveTickerAlias(query: string): string {
  return tickerAliases[query.trim().toUpperCase()] || query.trim();
}
