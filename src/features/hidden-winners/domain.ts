import type { MomentumScore } from "@/types";

export type HiddenWinnersResult = {
  candidates: MomentumScore[];
  generatedAt: string;
  message: "Insufficient evidence available.";
};
