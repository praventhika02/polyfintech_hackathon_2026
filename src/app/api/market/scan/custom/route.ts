import { NextResponse } from "next/server";
import { marketScanService } from "@/services/market/scan-service";
import { createApiResponse } from "@/utils/api-response";
import type { MarketScanRequest } from "@/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<MarketScanRequest>;
  const scan = await marketScanService.runScan({ ...body, scanType: "custom", companies: body.companies || [] });
  return NextResponse.json(createApiResponse(scan, "POST /api/market/scan/custom"));
}
