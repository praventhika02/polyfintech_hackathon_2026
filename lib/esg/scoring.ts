import { scoringWeights } from "@/lib/esg/config";
import type { CompanyProfile, ESGAnalysis, ESGCategory, JobSignal, MarketSnapshot, NewsArticle, PatentSignal } from "@/lib/esg/types";

const positiveWords = [
  "renewable",
  "sustainable",
  "transition",
  "carbon reduction",
  "clean energy",
  "decarbon",
  "net zero",
  "solar",
  "battery",
  "recycling",
  "safety",
  "ethics",
  "transparency",
  "diversity",
  "green bond",
  "climate target"
];

const negativeWords = [
  "lawsuit",
  "probe",
  "pollution",
  "fraud",
  "strike",
  "controversy",
  "fine",
  "emission breach",
  "deforestation",
  "bribery",
  "corruption",
  "spill",
  "forced labor",
  "greenwashing",
  "regulator",
  "violation"
];

export function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function scoreTone(text: string) {
  const lower = text.toLowerCase();
  let score = 0;
  positiveWords.forEach((word) => {
    if (lower.includes(word)) score += 1.2;
  });
  negativeWords.forEach((word) => {
    if (lower.includes(word)) score -= 1.6;
  });
  return score;
}

export function sentimentFromTone(tone: number): NewsArticle["sentiment"] {
  if (tone > 0.8) return "positive";
  if (tone < -0.8) return "negative";
  return "neutral";
}

export function classifyCategory(text: string): ESGCategory {
  const lower = text.toLowerCase();
  if (/board|governance|audit|compliance|shareholder|fraud|bribery|corruption|regulator|disclosure|ethics/.test(lower)) return "G";
  if (/labor|labour|worker|safety|diversity|community|human rights|privacy|inclusive|training|union/.test(lower)) return "S";
  return "E";
}

export function riskType(text: string): NewsArticle["riskType"] | null {
  const lower = text.toLowerCase();
  if (/fraud|bribery|corruption|audit|regulator|lawsuit|probe|governance/.test(lower)) return "Governance";
  if (/pollution|emission|spill|deforestation|coal|climate|greenwashing/.test(lower)) return "Environmental";
  if (/strike|worker|safety|privacy|human rights|forced labor|labour|labor/.test(lower)) return "Social";
  return null;
}

function scoreNews(news: NewsArticle[]) {
  if (!news.length) return 0;
  const averageTone = news.reduce((sum, article) => sum + article.tone, 0) / news.length;
  const positives = news.filter((article) => article.sentiment === "positive").length;
  const risks = news.filter((article) => article.riskType).length;
  return Math.round(clamp(55 + averageTone * 9 + positives * 2.2 - risks * 4.5 + Math.min(news.length, 12)));
}

function scoreGovernance(news: NewsArticle[]) {
  if (!news.length) return 0;
  const governance = news.filter((article) => article.category === "G");
  if (!governance.length) return 0;
  const riskPenalty = governance.filter((article) => article.riskType === "Governance").length * 9;
  const positive = governance.filter((article) => article.sentiment === "positive").length * 6;
  return Math.round(clamp(58 + positive - riskPenalty, 22, 96));
}

function scoreTrend(news: NewsArticle[], market: MarketSnapshot | null) {
  if (!news.length && !market) return 0;
  const tone = news.reduce((sum, article) => sum + article.tone, 0);
  const marketPulse = market ? clamp(market.change3m / 1.8, -12, 12) : 0;
  const riskDrag = news.filter((article) => article.riskType).length * 2.5;
  return Math.round(clamp(56 + tone * 4 + marketPulse - riskDrag, 18, 96));
}

function buildForecast(currentScore: number, momentumScore: number) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = new Date();
    month.setMonth(month.getMonth() + index + 1);
    const drift = (momentumScore / 12) * (index + 1);
    const confidenceCurve = Math.sin(index / 2) * 1.2;
    return {
      month: month.toLocaleString("en", { month: "short" }),
      score: Math.round(clamp(currentScore + drift + confidenceCurve))
    };
  });
}

function classify(currentScore: number, momentumScore: number): ESGAnalysis["classification"] {
  if (currentScore < 68 && momentumScore >= 0) return "Hidden Winner";
  if (currentScore >= 68 && momentumScore >= 0) return "Future Leader";
  if (currentScore < 68 && momentumScore < 0) return "Value Trap";
  if (currentScore >= 68 && momentumScore < 0) return "Overrated Leader";
  return "Value Trap";
}

function investorSignal(currentScore: number, momentumScore: number, confidenceScore: number): ESGAnalysis["investorSignal"] {
  if (momentumScore >= 14 && confidenceScore >= 66) return "Buy";
  if (momentumScore >= 5) return "Watch";
  if (currentScore >= 70 && momentumScore > -8) return "Hold";
  return "Avoid";
}

export function buildAnalysis(
  company: CompanyProfile,
  news: NewsArticle[],
  market: MarketSnapshot | null,
  jobSignal: JobSignal,
  patentSignal: PatentSignal
): ESGAnalysis {
  const newsScore = scoreNews(news);
  const governance = scoreGovernance(news);
  const trendConsistency = scoreTrend(news, market);
  const weightedSignals = [
    { available: news.length > 0, weight: scoringWeights.newsEsgSentiment, value: newsScore },
    { available: jobSignal.available, weight: scoringWeights.greenJobHiringSignal, value: jobSignal.score },
    { available: patentSignal.available, weight: scoringWeights.patentInnovationSignal, value: patentSignal.score },
    { available: news.some((article) => article.category === "G"), weight: scoringWeights.governanceSignal, value: governance },
    { available: Boolean(market) || news.length > 0, weight: scoringWeights.trendConsistency, value: trendConsistency }
  ];
  const availableWeight = weightedSignals.filter((signal) => signal.available).reduce((sum, signal) => sum + signal.weight, 0);
  const currentScore = Math.round(
    availableWeight
      ? clamp(weightedSignals.reduce((sum, signal) => sum + (signal.available ? signal.weight * signal.value : 0), 0) / availableWeight)
      : clamp(50 + ((company.ticker.charCodeAt(0) || 0) % 9) - 4)
  );
  const riskCount = news.filter((article) => article.riskType).length;
  const marketPulse = market ? clamp(market.change3m / 2, -10, 10) : 0;
  const momentumScore = Math.round(
    clamp(
      (news.length ? (newsScore - 55) * 0.42 : 0) +
        (jobSignal.available ? (jobSignal.score - 50) * 0.16 : 0) +
        (patentSignal.available ? (patentSignal.score - 50) * 0.16 : 0) +
        marketPulse -
        riskCount * 3.2,
      -35,
      35
    )
  );
  const forecastScore = Math.round(clamp(currentScore + momentumScore * 0.72));
  const coveragePoints = [news.length > 0, jobSignal.available, patentSignal.available, Boolean(market)].filter(Boolean).length;
  const confidenceScore = Math.round(clamp(46 + coveragePoints * 12 + Math.min(news.length, 12) * 1.6 - riskCount * 1.2, 28, 96));
  const risks = news
    .filter((article) => article.riskType)
    .slice(0, 5)
    .map((article) => `${article.riskType}: ${article.title}`);

  const explanation = [
    news.length
      ? `${news.length} GDELT ESG news items were classified for ${company.name}.`
      : `Live ESG news coverage for ${company.name} was sparse, so confidence is intentionally lower.`,
    `News sentiment contributes ${newsScore}/100 using keyword sentiment and ESG category classification.`,
    `${jobSignal.reason} Hiring contributes ${Math.round(jobSignal.score)}/100.`,
    `${patentSignal.reason} Innovation contributes ${Math.round(patentSignal.score)}/100.`,
    market ? `Yahoo Finance shows ${market.change3m}% three-month price movement, used only as a trend consistency proxy.` : "Market trend data was unavailable, lowering confidence.",
    risks.length ? "Risk evidence is penalizing the forward momentum score." : "No severe ESG controversy appeared in the fetched evidence window."
  ];

  return {
    ...company,
    currentScore,
    forecastScore,
    momentumScore,
    confidenceScore,
    investorSignal: investorSignal(currentScore, momentumScore, confidenceScore),
    classification: classify(currentScore, momentumScore),
    signals: {
      news: newsScore,
      hiring: Math.round(jobSignal.score),
      patents: Math.round(patentSignal.score),
      governance,
      trendConsistency
    },
    coverage: {
      news: news.length > 0,
      jobs: jobSignal.available,
      patents: patentSignal.available,
      market: Boolean(market),
      satellite: false
    },
    explanation,
    risks,
    news,
    jobSignal,
    patentSignal,
    market,
    forecast: buildForecast(currentScore, momentumScore),
    updatedAt: new Date().toISOString()
  };
}
