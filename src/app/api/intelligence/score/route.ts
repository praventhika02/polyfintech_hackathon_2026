import { NextResponse } from "next/server";
import { intelligenceService } from "@/services/intelligence/service";
import { createApiResponse } from "@/utils/api-response";
import type { CompanyProfile, EvidenceCollection, EvidenceItem } from "@/types";

type ScoreBody = {
  company: CompanyProfile;
  evidence: EvidenceCollection | EvidenceItem[];
};

export async function POST(request: Request) {
  const body = await request.json() as ScoreBody;
  const result = await intelligenceService.analyse({ company: body.company, evidence: body.evidence });
  return NextResponse.json(createApiResponse({
    status: result.status,
    message: result.status === "insufficient_evidence" ? "Insufficient evidence available." : undefined,
    evidenceCount: result.evidenceSummary.total,
    scores: result.scores,
    classification: result.classification,
    evidenceReferences: result.explanation.evidenceReferences
  }, "POST /api/intelligence/score"));
}
