import { NextResponse } from "next/server";
import { marketScanService } from "@/services/market/scan-service";
import { createApiResponse } from "@/utils/api-response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sector = url.searchParams.get("sector") || "";
  const universe = await marketScanService.generateUniverse({ scanType: "sector", sector, query: sector, maxCompanies: Number(url.searchParams.get("maxCompanies") || 50) });
  return NextResponse.json(createApiResponse(universe, "GET /api/market/universe/sector?sector="));
}
