import { NextResponse } from "next/server";
import { analyzeCompany } from "@/lib/esg/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const analysis = await analyzeCompany(url.searchParams.get("q") || "DBS");
  return NextResponse.json({
    company: analysis.name,
    ticker: analysis.ticker,
    currentScore: analysis.currentScore,
    forecastScore: analysis.forecastScore,
    momentumScore: analysis.momentumScore,
    forecast: analysis.forecast
  });
}
