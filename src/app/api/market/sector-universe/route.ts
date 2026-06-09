import { NextResponse } from "next/server";
import { companyDiscoveryService } from "@/services/company/service";
import { createApiResponse } from "@/utils/api-response";
import type { SectorScanRequest } from "@/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SectorScanRequest;
  const universe = await companyDiscoveryService.generateUniverse({ ...body, query: body.query || body.sectors?.join(" ") });
  return NextResponse.json(createApiResponse(universe, "POST /api/market/sector-universe"));
}
