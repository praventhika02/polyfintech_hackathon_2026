import { NextResponse } from "next/server";
import { analyzeUniverse } from "@/lib/esg/data";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({ question: "" }));
  const question = String(body.question || "").toLowerCase();
  const universe = await analyzeUniverse(10);
  const hidden = universe.filter((company) => company.classification === "Hidden Winner").slice(0, 4);
  const risks = universe.filter((company) => company.risks.length > 0).slice(0, 4);

  let answer = "I can answer from the currently fetched ESG Alpha universe. ";
  if (question.includes("hidden")) {
    answer += hidden.length
      ? `Hidden winner candidates: ${hidden.map((company) => `${company.name} (${company.ticker}, momentum ${company.momentumScore})`).join(", ")}.`
      : "No hidden winners were detected in the current live sample.";
  } else if (question.includes("risk") || question.includes("warning") || question.includes("declin")) {
    answer += risks.length
      ? `Risk watchlist: ${risks.map((company) => `${company.name}: ${company.risks[0]}`).join(" | ")}.`
      : "No major ESG risk evidence was detected in the current live sample.";
  } else {
    const leaders = universe.slice(0, 5);
    answer += `Fastest improving companies: ${leaders.map((company) => `${company.name} (${company.momentumScore})`).join(", ")}.`;
  }

  return NextResponse.json({
    answer,
    evidence: universe.slice(0, 5).map((company) => ({
      ticker: company.ticker,
      name: company.name,
      momentumScore: company.momentumScore,
      confidenceScore: company.confidenceScore,
      classification: company.classification
    }))
  });
}
