import { NextResponse } from "next/server";
import { intelligenceService } from "@/services/intelligence/service";
import { createApiResponse } from "@/utils/api-response";
import type { EvidenceItem } from "@/types";
import type { ClassifiedEvidence } from "@/types/intelligence";

type RiskBody = {
  evidence: EvidenceItem[];
  classifiedEvidence?: ClassifiedEvidence[];
};

export async function POST(request: Request) {
  const body = await request.json() as RiskBody;
  const evidence = Array.isArray(body.evidence) ? body.evidence : [];
  const classified = body.classifiedEvidence || await intelligenceService.classifyEvidence(evidence);
  const alerts = intelligenceService.risks(evidence, classified);
  const status = alerts.some((alert) => alert.severity === "Critical")
    ? "Critical"
    : alerts.some((alert) => alert.severity === "High") || alerts.length >= 3
      ? "Alert"
      : alerts.length
        ? "Watch"
        : "Clear";
  return NextResponse.json(createApiResponse({ status, riskCount: alerts.length, alerts }, "POST /api/intelligence/risk"));
}
