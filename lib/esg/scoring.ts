import type { CompanySeed, ESGAnalysis, MarketSnapshot, NewsArticle, SignalBreakdown } from "@/lib/esg/types";

const positiveWords = [
  "green", "renewable", "sustainable", "transition", "carbon reduction", "climate", "clean",
  "impact", "governance", "inclusive", "electric", "recycling", "decarbon", "net zero",
  "solar", "battery", "safety", "ethics", "transparency", "diversity"
];

const negativeWords = [
  "lawsuit", "probe", "pollution", "coal", "fraud", "strike", "controversy", "fine",
  "emission breach", "deforestation", "bribery", "corruption", "spill", "forced labor",
  "greenwashing", "recall", "regulator", "violation"
];

export const scoringWeights = {
  newsEsgSentiment: 0.35,
  greenHiringSignal: 0.2,
  patentInnovationSignal: 0.2,
  governanceSignal: 0.15,
  trendConsistency: 0.1
};

export function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function scoreTone(text: string) {
  const lower = text.toLowerCase();
  let score = 0;
  positiveWords.forEach((word) => {
    if (lower.includes(word)) score += 1;
  });
  negativeWords.forEach((word) => {
    if (lower.includes(word)) score -= 1.35;
  });
  return score;
}

export function classifyCategory(text: string): NewsArticle["category"] {
  const lower = text.toLowerCase();
  if (/board|governance|audit|compliance|shareholder|fraud|bribery|corruption|regulator|disclosure/.test(lower)) return "G";
  if (/labor|labour|worker|safety|diversity|community|human rights|privacy|inclusive|training/.test(lower)) return "S";
  return "E";
}

export function riskType(text: string) {
  const lower = text.toLowerCase();
  if (/fraud|bribery|corruption|audit|regulator|lawsuit|probe/.test(lower)) return "Governance";
  if (/pollution|emission|spill|deforestation|coal|climate/.test(lower)) return "Environmental";
  if (/strike|worker|safety|privacy|human rights|forced labor|labour/.test(lower)) return "Social";
  return null;
}

function keywordSignal(news: NewsArticle[], pattern: RegExp, base: number, weight: number) {
  const matches = news.filter((article) => pattern.test(article.title)).length;
  const tone = news.reduce((sum, article) => sum + article.tone, 0);
  return Math.round(clamp(base + matches * weight + news.length * 1.15 + tone * 2.6, 22, 96));
}

function buildForecast(currentScore: number, momentumScore: number) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = new Date();
    month.setMonth(month.getMonth() + index + 1);
    const drift = (momentumScore / 12) * (index + 1);
    const seasonality = Math.sin(index / 1.7) * 1.4;
    return {
      month: month.toLocaleString("en", { month: "short" }),
      score: Math.round(clamp(currentScore + drift + seasonality, 0, 100))
    };
  });
}

function classify(currentScore: number, momentumScore: number): ESGAnalysis["classification"] {
  if (currentScore < 68 && momentumScore >= 8) return "Hidden Winner";
  if (currentScore >= 68 && momentumScore >= 0) return "Future Leader";
  if (currentScore < 68 && momentumScore < 0) return "Value Trap";
  return "Overrated Leader";
}

function investorSignal(currentScore: number, momentumScore: number, confidenceScore: number): ESGAnalysis["investorSignal"] {
  if (momentumScore >= 14 && confidenceScore >= 70) return "Buy";
  if (momentumScore >= 5) return "Watch";
  if (currentScore >= 70 && momentumScore > -8) return "Hold";
  return "Avoid";
}

export function buildAnalysis(company: CompanySeed, news: NewsArticle[], market: MarketSnapshot | null): ESGAnalysis {
  const newsSignal = keywordSignal(news, /sustainability|esg|green|climate|renewable|governance|carbon|transition|net zero/i, 48, 4.4);
  const hiring = keywordSignal(news, /hiring|jobs|talent|specialist|department|workforce|training|chief sustainability/i, 42, 11);
  const patent = keywordSignal(news, /patent|innovation|technology|clean|renewable|ai|electric|battery|recycling|transition/i, 42, 9);
  const emissions = keywordSignal(news, /emission|carbon|climate|renewable|solar|green|energy|decarbon|net zero/i, 46, 9);
  const governance = keywordSignal(news, /governance|board|risk|compliance|audit|shareholder|investor|vote|ethics/i, 49, 9);
  const tone = news.reduce((sum, article) => sum + article.tone, 0);
  const marketPulse = clamp((market?.change3m || 0) / 2, -9, 9);
  const dataVolume = clamp(news.length * 2.5, 0, 24);
  const stability = 7 - Math.min(6, Math.abs(company.beta - 1) * 4.4);
  const trendConsistency = Math.round(clamp(56 + tone * 5 + marketPulse + stability, 20, 96));

  const weighted =
    scoringWeights.newsEsgSentiment * newsSignal +
    scoringWeights.greenHiringSignal * hiring +
    scoringWeights.patentInnovationSignal * patent +
    scoringWeights.governanceSignal * governance +
    scoringWeights.trendConsistency * trendConsistency;

  const currentScore = Math.round(clamp(weighted + dataVolume * 0.42 + marketPulse * 0.7, 18, 98));
  const riskPenalty = news.filter((article) => article.riskType).length * 3.5;
  const momentumScore = Math.round(clamp((newsSignal - 58) * 0.35 + (hiring - 50) * 0.18 + (patent - 50) * 0.18 + marketPulse - riskPenalty, -35, 35));
  const forecastScore = Math.round(clamp(currentScore + momentumScore * 0.72, 0, 100));
  const confidenceScore = Math.round(clamp(52 + dataVolume + (market ? 9 : 0) + Math.min(12, Math.abs(tone) * 2), 35, 96));
  const signals: SignalBreakdown = { news: newsSignal, hiring, patent, emissions, governance, trendConsistency };
  const risks = news.filter((article) => article.riskType).slice(0, 4).map((article) => `${article.riskType}: ${article.title}`);

  const explanation = [
    `${news.length || "Limited"} ESG-relevant live articles were detected for ${company.name}.`,
    `News sentiment contributes ${newsSignal}/100 to the momentum model.`,
    `Green hiring proxy is ${hiring}/100 and innovation proxy is ${patent}/100 based on public signals.`,
    market ? `Market trend contributes ${market.change3m}% over 3 months from ${market.source}.` : "Market data was unavailable, lowering confidence.",
    risks.length ? "Risk evidence reduces the forward score until fresh positive signals offset it." : "No major live ESG controversy was detected in the fetched evidence."
  ];

  return {
    ...company,
    currentScore,
    forecastScore,
    momentumScore,
    confidenceScore,
    investorSignal: investorSignal(currentScore, momentumScore, confidenceScore),
    classification: classify(currentScore, momentumScore),
    signals,
    explanation,
    risks,
    news,
    market,
    coverage: {
      news: news.length > 0,
      market: Boolean(market),
      jobs: false,
      patents: false,
      satellite: false
    },
    forecast: buildForecast(currentScore, momentumScore),
    updatedAt: new Date().toISOString()
  };
}
