import { NextResponse } from "next/server";
import { analyzeCompany } from "@/lib/esg/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || url.searchParams.get("ticker") || "DBS";
  const analysis = await analyzeCompany(query);
  return NextResponse.json({ analysis });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const query = body.company || body.ticker || "DBS";
  const analysis = await analyzeCompany(query);
  return NextResponse.json({ analysis });
}
