import { NextResponse } from "next/server";
import { evidenceCollectionService } from "@/services/evidence/collection-service";
import { createApiResponse } from "@/utils/api-response";

export async function GET() {
  const statuses = await evidenceCollectionService.providerHealth();
  return NextResponse.json(createApiResponse({ statuses }, "GET /api/provider/health"));
}
