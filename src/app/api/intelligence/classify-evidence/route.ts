import { NextResponse } from "next/server";
import { intelligenceService } from "@/services/intelligence/service";
import { createApiResponse } from "@/utils/api-response";
import type { EvidenceItem } from "@/types";

type ClassifyBody = {
  evidence: EvidenceItem[];
};

export async function POST(request: Request) {
  const body = await request.json() as ClassifyBody;
  const classified = await intelligenceService.classifyEvidence(body.evidence || []);
  return NextResponse.json(createApiResponse({ classified }, "POST /api/intelligence/classify-evidence"));
}
