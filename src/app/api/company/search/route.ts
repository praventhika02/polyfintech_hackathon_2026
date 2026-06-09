import { NextResponse } from "next/server";
import { companyDiscoveryService } from "@/services/company/service";
import { createApiResponse } from "@/utils/api-response";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") || "";
  const limit = Number(new URL(request.url).searchParams.get("limit") || 10);
  const result = await companyDiscoveryService.search(query, limit);
  return NextResponse.json(createApiResponse(result, "GET /api/company/search?q=DBS&limit=10"));
}
