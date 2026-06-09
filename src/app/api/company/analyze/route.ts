import { NextResponse } from "next/server";
import { scoringService } from "@/services";
import { createApiResponse } from "@/utils/api-response";
import type { EvidenceItem } from "@/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({ companyId: "unknown" }))) as { companyId?: string; evidence?: EvidenceItem[] };
  const companyId = body.companyId || "unknown";
  const momentum = scoringService.calculateMomentum(companyId, body.evidence || []);
  return NextResponse.json(createApiResponse({ momentum }));
}
