import { NextResponse } from "next/server";
import { companyDiscoveryService } from "@/services/company/service";
import { newsService } from "@/services/news/service";
import { evidenceRepository } from "@/services/storage/evidence-repository";
import { createApiResponse } from "@/utils/api-response";

export async function GET(request: Request) {
  const ticker = new URL(request.url).searchParams.get("ticker") || "";
  const metadata = await companyDiscoveryService.metadata(ticker);
  if (!metadata.company) return NextResponse.json(createApiResponse({ items: [], statuses: metadata.statuses, message: "Insufficient evidence available." }));
  const result = await newsService.getCompanyEvidence(metadata.company);
  await evidenceRepository.saveEvidence(result.items);
  await evidenceRepository.saveProviderStatuses(result.statuses);
  return NextResponse.json(createApiResponse(result, "GET /api/evidence/news?ticker=MSFT"));
}
