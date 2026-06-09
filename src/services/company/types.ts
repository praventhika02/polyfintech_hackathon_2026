import type { CompanyProfile, EvidenceSourceStatus, SectorScanRequest } from "@/types";

export type CompanyProvider = {
  name: EvidenceSourceStatus["provider"];
  search(query: string, limit: number): Promise<{ companies: CompanyProfile[]; status: EvidenceSourceStatus }>;
  metadata(ticker: string): Promise<{ company: CompanyProfile | null; status: EvidenceSourceStatus }>;
};

export type UniverseProvider = {
  generateUniverse(request: SectorScanRequest): Promise<{ companies: CompanyProfile[]; statuses: EvidenceSourceStatus[] }>;
};
