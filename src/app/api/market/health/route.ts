import { NextResponse } from "next/server";
import { marketScanService } from "@/services/market/scan-service";
import { createApiResponse } from "@/utils/api-response";

export async function GET() {
  return NextResponse.json(createApiResponse(marketScanService.health(), "GET /api/market/health"));
}
