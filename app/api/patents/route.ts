import { NextResponse } from "next/server";
import { fetchPatentSignal, resolveCompany } from "@/lib/esg/connectors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const company = await resolveCompany(url.searchParams.get("q") || "DBS");
  const signal = await fetchPatentSignal(company);
  return NextResponse.json({ company, signal });
}
