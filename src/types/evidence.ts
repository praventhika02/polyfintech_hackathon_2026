export type EvidenceSource =
  | "news"
  | "jobs"
  | "patents"
  | "finance"
  | "filings"
  | "governance"
  | "manual";

export type EvidenceItem = {
  id: string;
  source: EvidenceSource;
  title: string;
  url?: string;
  publisher?: string;
  publishedAt?: string;
  capturedAt: string;
  excerpt?: string;
  reliability: number;
  tags: string[];
};
