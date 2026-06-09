import { NextResponse } from "next/server";
import { intelligenceService } from "@/services/intelligence/service";
import { createApiResponse } from "@/utils/api-response";

export async function GET() {
  return NextResponse.json(createApiResponse(intelligenceService.health(), "GET /api/intelligence/health"));
}
