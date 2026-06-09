import { NextResponse } from "next/server";
import { marketScanService } from "@/services/market/scan-service";
import { createApiResponse } from "@/utils/api-response";

export async function GET(_request: Request, context: { params: { scanId: string } }) {
  const scan = marketScanService.getScan(context.params.scanId);
  if (!scan) {
    return NextResponse.json(createApiResponse({ status: "failed", message: "Scan not found." }), { status: 404 });
  }
  return NextResponse.json(createApiResponse(scan, "GET /api/market/scan/:scanId"));
}
