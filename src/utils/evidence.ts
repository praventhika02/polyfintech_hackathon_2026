import type { EvidenceConfidence, EvidenceSource, EvidenceSourceStatus } from "@/types";

export function matchedKeywords(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  return keywords.filter((keyword) => lower.includes(keyword.toLowerCase()));
}

export function confidenceFromMatches(matches: string[], hasUrl: boolean): EvidenceConfidence {
  if (matches.length >= 3 && hasUrl) return "high";
  if (matches.length >= 1) return "medium";
  return "low";
}

export function sourceStatus(
  source: EvidenceSource | "company",
  provider: EvidenceSourceStatus["provider"],
  status: EvidenceSourceStatus["status"],
  evidenceCount: number,
  message: string,
  cacheTtlSeconds: number
): EvidenceSourceStatus {
  return {
    source,
    provider,
    status,
    evidenceCount,
    message,
    checkedAt: new Date().toISOString(),
    cacheTtlSeconds
  };
}

export function insufficientEvidence(evidenceCount: number) {
  return {
    status: "insufficient_evidence" as const,
    message: "Insufficient evidence available." as const,
    evidenceCount,
    checkedAt: new Date().toISOString()
  };
}
