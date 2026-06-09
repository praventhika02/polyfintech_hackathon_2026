import type { DynamicUniverse, SectorScanRequest } from "@/types";

export type MarketScanEngine = {
  runScan(request: SectorScanRequest): Promise<DynamicUniverse>;
};
