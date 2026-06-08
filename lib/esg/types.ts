export type CompanySeed = {
  id: string;
  name: string;
  ticker: string;
  region: string;
  sector: string;
  country: string;
  beta: number;
};

export type NewsArticle = {
  title: string;
  url: string;
  source: string;
  domain?: string;
  seenDate?: string;
  tone: number;
  category: "E" | "S" | "G";
  riskType: string | null;
};

export type MarketSnapshot = {
  ticker: string;
  price: number;
  currency: string;
  change3m: number;
  source: string;
};

export type SignalBreakdown = {
  news: number;
  hiring: number;
  patent: number;
  emissions: number;
  governance: number;
  trendConsistency: number;
};

export type ESGAnalysis = CompanySeed & {
  currentScore: number;
  forecastScore: number;
  momentumScore: number;
  confidenceScore: number;
  investorSignal: "Buy" | "Watch" | "Hold" | "Avoid";
  classification: "Hidden Winner" | "Future Leader" | "Value Trap" | "Overrated Leader";
  signals: SignalBreakdown;
  explanation: string[];
  risks: string[];
  news: NewsArticle[];
  market: MarketSnapshot | null;
  coverage: {
    news: boolean;
    market: boolean;
    jobs: boolean;
    patents: boolean;
    satellite: boolean;
  };
  forecast: Array<{ month: string; score: number }>;
  updatedAt: string;
};
