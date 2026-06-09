import { NextResponse } from "next/server";
import { intelligenceService } from "@/services/intelligence/service";
import { createApiResponse } from "@/utils/api-response";
import type { CompanyProfile, EvidenceCollection, EvidenceItem } from "@/types";

type VerdictBody = {
  company: CompanyProfile;
  evidence: EvidenceCollection | EvidenceItem[];
};

export async function POST(request: Request) {
  const body = await request.json() as VerdictBody;
  const result = await intelligenceService.analyse({ company: body.company, evidence: body.evidence });
  return NextResponse.json(createApiResponse({
    status: result.status,
    verdict: result.verdict,
    reasons: [
      ...result.explanation.positiveDrivers,
      ...result.explanation.negativeDrivers,
      ...result.explanation.riskDrivers
    ].slice(0, 3),
    evidenceReferences: result.explanation.evidenceReferences
  }, "POST /api/intelligence/verdict"));
}
