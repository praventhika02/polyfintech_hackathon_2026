import { NextResponse } from "next/server";
import { analyzeCompany, analyzeUniverse } from "@/lib/esg/data";

export const dynamic = "force-dynamic";

function extractTicker(question: string) {
  const match = question.match(/\b[A-Z0-9.]{2,8}\b/);
  return match?.[0];
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({ question: "" }));
  const rawQuestion = String(body.question || "");
  const question = rawQuestion.toLowerCase();

  if (question.includes("why")) {
    const ticker = extractTicker(rawQuestion) || "DBS";
    const analysis = await analyzeCompany(ticker);
    return NextResponse.json({
      answer: `${analysis.name} is classified as ${analysis.classification} with momentum ${analysis.momentumScore}. ${analysis.explanation.slice(0, 4).join(" ")}`,
      evidence: analysis.news.slice(0, 4)
    });
  }

  const universe = await analyzeUniverse(10);
  const ranked = [...universe].sort((a, b) => b.momentumScore - a.momentumScore);

  if (question.includes("hidden")) {
    const hidden = ranked.filter((company) => company.classification === "Hidden Winner").slice(0, 5);
    return NextResponse.json({
      answer: hidden.length
        ? `Hidden ESG winner candidates: ${hidden.map((company) => `${company.name} (${company.ticker}, momentum ${company.momentumScore}, confidence ${company.confidenceScore}%)`).join("; ")}.`
        : "No hidden winners were detected in the current live sample. The model will not invent candidates without evidence.",
      evidence: hidden
    });
  }

  if (question.includes("risk") || question.includes("warning") || question.includes("declin")) {
    const risks = ranked.filter((company) => company.risks.length || company.momentumScore < 0).slice(0, 5);
    return NextResponse.json({
      answer: risks.length
        ? `Risk watchlist: ${risks.map((company) => `${company.name} (${company.ticker}): ${company.risks[0] || `momentum ${company.momentumScore}`}`).join(" | ")}.`
        : "No major ESG deterioration was detected in the current live sample.",
      evidence: risks
    });
  }

  return NextResponse.json({
    answer: `Fastest improving companies in the current live sample: ${ranked.slice(0, 5).map((company) => `${company.name} (${company.ticker}, momentum ${company.momentumScore})`).join("; ")}.`,
    evidence: ranked.slice(0, 5)
  });
}
