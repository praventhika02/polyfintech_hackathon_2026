"use client";

import { create } from "zustand";
import type { Company, EvidenceItem, ForecastScenario, MomentumScore, RiskAlert } from "@/types";

type CompanyState = {
  activeCompany: Company | null;
  evidence: EvidenceItem[];
  risks: RiskAlert[];
  momentum: MomentumScore | null;
  forecasts: ForecastScenario[];
  setActiveCompany: (company: Company | null) => void;
  setEvidence: (evidence: EvidenceItem[]) => void;
  setRisks: (risks: RiskAlert[]) => void;
  setMomentum: (momentum: MomentumScore | null) => void;
  setForecasts: (forecasts: ForecastScenario[]) => void;
};

export const useCompanyStore = create<CompanyState>((set) => ({
  activeCompany: null,
  evidence: [],
  risks: [],
  momentum: null,
  forecasts: [],
  setActiveCompany: (activeCompany) => set({ activeCompany }),
  setEvidence: (evidence) => set({ evidence }),
  setRisks: (risks) => set({ risks }),
  setMomentum: (momentum) => set({ momentum }),
  setForecasts: (forecasts) => set({ forecasts })
}));
