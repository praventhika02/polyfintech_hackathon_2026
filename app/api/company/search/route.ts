import { NextResponse } from "next/server";
import { searchCompanies } from "@/lib/esg/universe";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  return NextResponse.json({ companies: searchCompanies(query) });
}
