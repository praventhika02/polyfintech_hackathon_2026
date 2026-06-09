import { NextResponse } from "next/server";
import { searchCompanies } from "@/lib/esg/connectors";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const companies = await searchCompanies(query);
  return NextResponse.json({ companies });
}
