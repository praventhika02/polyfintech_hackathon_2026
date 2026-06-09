import type { MarketScanRequest, MarketScanResult } from "@/types";

export type MarketScanEngine = {
  runScan(request: MarketScanRequest): Promise<MarketScanResult>;
};
