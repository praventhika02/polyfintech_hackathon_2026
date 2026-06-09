export type ESGCategory = "E" | "S" | "G";
export type InvestorSignal = "Buy" | "Watch" | "Hold" | "Avoid";
export type MomentumClass = "Hidden Winner" | "Future Leader" | "Value Trap" | "Overrated Leader";

export type CompanyProfile = {
  name: string;
  ticker: string;
  exchange?: string;
  country?: string;
  sector?: string;
  marketCap?: number;
  beta?: number;
};

export type NewsArticle = {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
  tone: number;
  category: ESGCategory;
  sentiment: "positive" | "neutral" | "negative";
  riskType?: "Environmental" | "Social" | "Governance";
};

export type JobSignal = {
  available: boolean;
  score: number;
  count: number;
  source: string;
  reason: string;
};

export type PatentSignal = {
  available: boolean;
  score: number;
  count: number;
  source: string;
  reason: string;
};

export type MarketSnapshot = {
  price?: number;
  currency?: string;
  change3m: number;
  source: string;
};

export type SignalBreakdown = {
  news: number;
  hiring: number;
  patents: number;
  governance: number;
  trendConsistency: number;
};

export type ForecastPoint = {
  month: string;
  score: number;
};

export type ESGAnalysis = CompanyProfile & {
  currentScore: number;
  forecastScore: number;
  momentumScore: number;
  confidenceScore: number;
  investorSignal: InvestorSignal;
  classification: MomentumClass;
  signals: SignalBreakdown;
  coverage: {
    news: boolean;
    jobs: boolean;
    patents: boolean;
    market: boolean;
    satellite: boolean;
  };
  explanation: string[];
  risks: string[];
  news: NewsArticle[];
  jobSignal: JobSignal;
  patentSignal: PatentSignal;
  market: MarketSnapshot | null;
  forecast: ForecastPoint[];
  updatedAt: string;
};
