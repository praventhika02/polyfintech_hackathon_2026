import type { DynamicUniverse, SectorScanRequest } from "@/types";
import { companyDiscoveryService } from "@/services/company/service";

export async function runMarketScan(request: SectorScanRequest): Promise<DynamicUniverse> {
  return companyDiscoveryService.generateUniverse(request);
}
