import { NextResponse } from "next/server";
import { companyDiscoveryService } from "@/services/company/service";
import { evidenceCollectionService } from "@/services/evidence/collection-service";
import { createApiResponse } from "@/utils/api-response";

export async function GET(request: Request) {
  const ticker = new URL(request.url).searchParams.get("ticker") || "";
  const metadata = await companyDiscoveryService.metadata(ticker);
  if (!metadata.company) return NextResponse.json(createApiResponse({ items: [], statuses: metadata.statuses, message: "Insufficient evidence available." }));
  const collection = await evidenceCollectionService.collectCompanyEvidence(metadata.company);
  return NextResponse.json(createApiResponse({ items: collection.items.filter((item) => item.source === "governance"), statuses: collection.statuses }, "GET /api/evidence/governance?ticker=MSFT"));
}
