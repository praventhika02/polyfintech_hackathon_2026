import { NextResponse } from "next/server";
import { marketScanService } from "@/services/market/scan-service";
import { createApiResponse } from "@/utils/api-response";
import type { MarketScanRequest } from "@/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scanType = (url.searchParams.get("scanType") || "search") as MarketScanRequest["scanType"];
  const universe = await marketScanService.generateUniverse({
    scanType,
    query: url.searchParams.get("query") || undefined,
    sector: url.searchParams.get("sector") || undefined,
    exchange: url.searchParams.get("exchange") || undefined,
    country: url.searchParams.get("country") || undefined,
    maxCompanies: Number(url.searchParams.get("maxCompanies") || 50)
  });
  return NextResponse.json(createApiResponse(universe, "GET /api/market/universe"));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as MarketScanRequest;
  const universe = await marketScanService.generateUniverse({ ...body, scanType: body.scanType || "search" });
  return NextResponse.json(createApiResponse(universe, "POST /api/market/universe"));
}
