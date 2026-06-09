import { NextResponse } from "next/server";
import { runMarketScan } from "@/features/market-scan/service";
import { createApiResponse } from "@/utils/api-response";
import type { SectorScanRequest } from "@/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SectorScanRequest;
  const scan = await runMarketScan(body);
  return NextResponse.json(createApiResponse(scan));
}
