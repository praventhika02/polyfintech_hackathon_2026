import { NextResponse } from "next/server";
import { companyDiscoveryService } from "@/services/company/service";
import { createApiResponse } from "@/utils/api-response";

export async function GET(request: Request) {
  const ticker = new URL(request.url).searchParams.get("ticker") || "";
  const result = await companyDiscoveryService.metadata(ticker);
  return NextResponse.json(createApiResponse(result, "GET /api/company/metadata?ticker=MSFT"));
}
