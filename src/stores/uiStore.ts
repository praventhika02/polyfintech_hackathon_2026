"use client";

import { create } from "zustand";

type UiState = {
  navigationOpen: boolean;
  activeExperience: "market" | "company" | "portfolio" | "methodology" | "settings";
  setNavigationOpen: (navigationOpen: boolean) => void;
  setActiveExperience: (activeExperience: UiState["activeExperience"]) => void;
};

export const useUiStore = create<UiState>((set) => ({
  navigationOpen: false,
  activeExperience: "market",
  setNavigationOpen: (navigationOpen) => set({ navigationOpen }),
  setActiveExperience: (activeExperience) => set({ activeExperience })
}));
