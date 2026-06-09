export type MomentumClass = "hidden_winner" | "future_leader" | "value_trap" | "overrated_leader";

export type MomentumScore = {
  companyId: string;
  currentScore: number;
  forecastScore: number;
  momentum: number;
  confidence: number;
  classification: MomentumClass;
  calculatedAt: string;
};
