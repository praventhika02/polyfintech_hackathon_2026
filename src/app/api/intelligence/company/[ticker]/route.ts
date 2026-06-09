import { NextResponse } from "next/server";
import { companyDiscoveryService } from "@/services/company/service";
import { intelligenceService } from "@/services/intelligence/service";
import { createApiResponse } from "@/utils/api-response";

export async function GET(_request: Request, context: { params: { ticker: string } }) {
  const metadata = await companyDiscoveryService.metadata(context.params.ticker);
  if (!metadata.company) {
    return NextResponse.json(createApiResponse({ status: "error", message: "Company not found in supported providers." }), { status: 404 });
  }
  const result = await intelligenceService.analyse({ company: metadata.company });
  return NextResponse.json(createApiResponse(result, "GET /api/intelligence/company/:ticker"));
}
