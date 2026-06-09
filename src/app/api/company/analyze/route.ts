import { NextResponse } from "next/server";
import { companyDiscoveryService } from "@/services/company/service";
import { evidenceCollectionService } from "@/services/evidence/collection-service";
import { scoringService } from "@/services";
import { createApiResponse } from "@/utils/api-response";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({ ticker: "" }))) as { ticker?: string; query?: string };
  const ticker = body.ticker || body.query || "";
  const metadata = await companyDiscoveryService.metadata(ticker);
  if (!metadata.company) {
    return NextResponse.json(createApiResponse({ status: "unavailable", message: "Insufficient evidence available.", providerStatuses: metadata.statuses }));
  }

  const collection = await evidenceCollectionService.collectCompanyEvidence(metadata.company);
  const momentum = scoringService.calculateMomentum(metadata.company.id, collection.items);
  return NextResponse.json(createApiResponse({ company: metadata.company, availability: collection.summary, momentum, statuses: [...metadata.statuses, ...collection.statuses] }));
}
