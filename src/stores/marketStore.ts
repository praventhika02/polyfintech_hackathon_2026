"use client";

import { create } from "zustand";
import type { MarketScan, MarketSignal } from "@/types";

type MarketState = {
  activeScan: MarketScan | null;
  signals: MarketSignal[];
  isScanning: boolean;
  setActiveScan: (scan: MarketScan | null) => void;
  setSignals: (signals: MarketSignal[]) => void;
  setIsScanning: (isScanning: boolean) => void;
};

export const useMarketStore = create<MarketState>((set) => ({
  activeScan: null,
  signals: [],
  isScanning: false,
  setActiveScan: (activeScan) => set({ activeScan }),
  setSignals: (signals) => set({ signals }),
  setIsScanning: (isScanning) => set({ isScanning })
}));
