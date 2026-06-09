import { NextResponse } from "next/server";
import { fetchNews, resolveCompany } from "@/lib/esg/connectors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const company = await resolveCompany(url.searchParams.get("q") || "DBS");
  const articles = await fetchNews(company);
  return NextResponse.json({ company, articles });
}
