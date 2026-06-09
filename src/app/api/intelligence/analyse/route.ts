import { NextResponse } from "next/server";
import { companyDiscoveryService } from "@/services/company/service";
import { intelligenceService } from "@/services/intelligence/service";
import { createApiResponse } from "@/utils/api-response";
import { stableId } from "@/utils/ids";
import type { CompanyProfile, EvidenceCollection, EvidenceItem } from "@/types";

type AnalyseBody = {
  company?: CompanyProfile;
  ticker?: string;
  evidence?: EvidenceCollection | EvidenceItem[];
};

function normalizeCompany(company: CompanyProfile): CompanyProfile {
  const name = company.name || company.ticker || "Unknown Company";
  const ticker = company.ticker || "UNKNOWN";
  return {
    ...company,
    id: company.id || stableId("company", `${name}:${ticker}`),
    name,
    ticker
  };
}

export async function POST(request: Request) {
  const body = await request.json() as AnalyseBody;
  let company = body.company ? normalizeCompany(body.company) : undefined;

  if (!company && body.ticker) {
    const metadata = await companyDiscoveryService.metadata(body.ticker);
    company = metadata.company || undefined;
  }

  if (!company) {
    return NextResponse.json(createApiResponse({ status: "error", message: "Company not found in supported providers." }), { status: 404 });
  }

  try {
    const result = await intelligenceService.analyse({ company, evidence: body.evidence });
    return NextResponse.json(createApiResponse(result, "POST /api/intelligence/analyse"));
  } catch (error) {
    return NextResponse.json(
      createApiResponse({ status: "error", message: error instanceof Error ? error.message : "Intelligence analysis failed." }),
      { status: 500 }
    );
  }
}
