import { NextResponse } from "next/server";
import { createApiResponse } from "@/utils/api-response";
import type { Company } from "@/types";

export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") || "";
  const companies: Company[] = query
    ? [
        {
          id: `company_${query.toLowerCase()}`,
          name: query,
          ticker: query.toUpperCase()
        }
      ]
    : [];

  return NextResponse.json(createApiResponse({ companies }));
}
