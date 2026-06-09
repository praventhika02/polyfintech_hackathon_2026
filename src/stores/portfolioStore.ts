"use client";

import { create } from "zustand";
import type { PortfolioAnalysis, PortfolioHolding } from "@/types";

type PortfolioState = {
  holdings: PortfolioHolding[];
  activeAnalysis: PortfolioAnalysis | null;
  setHoldings: (holdings: PortfolioHolding[]) => void;
  setActiveAnalysis: (analysis: PortfolioAnalysis | null) => void;
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
  holdings: [],
  activeAnalysis: null,
  setHoldings: (holdings) => set({ holdings }),
  setActiveAnalysis: (activeAnalysis) => set({ activeAnalysis })
}));
