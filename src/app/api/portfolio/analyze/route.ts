import { NextResponse } from "next/server";
import { analyzePortfolio } from "@/features/portfolio-intelligence/service";
import { createApiResponse } from "@/utils/api-response";
import type { PortfolioHolding } from "@/types";

type PortfolioRequest = {
  name?: string;
  holdings?: PortfolioHolding[];
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as PortfolioRequest;
  const analysis = await analyzePortfolio(body.name || "Untitled portfolio", body.holdings || []);
  return NextResponse.json(createApiResponse(analysis));
}
