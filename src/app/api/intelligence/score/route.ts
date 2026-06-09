import { NextResponse } from "next/server";
import { intelligenceService } from "@/services/intelligence/service";
import { createApiResponse } from "@/utils/api-response";
import { stableId } from "@/utils/ids";
import type { CompanyProfile, EvidenceCollection, EvidenceItem } from "@/types";

type ScoreBody = {
  company: CompanyProfile;
  evidence: EvidenceCollection | EvidenceItem[];
};

function normalizeCompany(company: CompanyProfile | undefined): CompanyProfile | null {
  if (!company) return null;
  const name = company.name || company.ticker || "Unknown Company";
  const ticker = company.ticker || "UNKNOWN";
  return { ...company, id: company.id || stableId("company", `${name}:${ticker}`), name, ticker };
}

export async function POST(request: Request) {
  const body = await request.json() as ScoreBody;
  const company = normalizeCompany(body.company);
  if (!company) {
    return NextResponse.json(createApiResponse({ status: "error", message: "Company is required.", scores: null }), { status: 400 });
  }
  const result = await intelligenceService.analyse({ company, evidence: body.evidence || [] });
  return NextResponse.json(createApiResponse({
    status: result.status,
    message: result.status === "insufficient_evidence" ? "Insufficient evidence available." : undefined,
    evidenceCount: result.evidenceSummary.total,
    scores: result.scores,
    classification: result.classification,
    evidenceReferences: result.explanation.evidenceReferences
  }, "POST /api/intelligence/score"));
}
