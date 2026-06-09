import type { MarketScanRequest, MarketScanResult, MarketUniverse, SectorScanRequest } from "@/types";
import { marketScanService } from "@/services/market/scan-service";

export async function runMarketScan(request: SectorScanRequest | MarketScanRequest): Promise<MarketScanResult> {
  const scanType = "scanType" in request ? request.scanType : "search";
  return marketScanService.runScan({ ...request, scanType });
}

export async function generateMarketUniverse(request: MarketScanRequest): Promise<MarketUniverse> {
  return marketScanService.generateUniverse(request);
}
