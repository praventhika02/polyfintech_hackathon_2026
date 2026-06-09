import { NextResponse } from "next/server";
import { companyDiscoveryService } from "@/services/company/service";
import { evidenceCollectionService } from "@/services/evidence/collection-service";
import { createApiResponse } from "@/utils/api-response";

export async function GET(request: Request) {
  const ticker = new URL(request.url).searchParams.get("ticker") || "";
  const metadata = await companyDiscoveryService.metadata(ticker);
  if (!metadata.company) {
    return NextResponse.json(createApiResponse({ message: "Insufficient evidence available.", statuses: metadata.statuses }));
  }
  const collection = await evidenceCollectionService.collectCompanyEvidence(metadata.company);
  return NextResponse.json(createApiResponse(collection, "GET /api/evidence/collection?ticker=MSFT"));
}
