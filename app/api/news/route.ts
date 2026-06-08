import { NextResponse } from "next/server";
import { fetchNews } from "@/lib/esg/data";
import { findCompany } from "@/lib/esg/universe";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const company = findCompany(url.searchParams.get("q") || "DBS");
  const articles = await fetchNews(company);
  return NextResponse.json({ company, articles });
}
