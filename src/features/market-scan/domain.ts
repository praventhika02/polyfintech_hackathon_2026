import type { MarketScan, SectorScanRequest } from "@/types";

export type MarketScanEngine = {
  runScan(request: SectorScanRequest): Promise<MarketScan>;
};
