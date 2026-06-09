import type { Company, RiskAlert } from "@/types";
import { emptyGovernanceProvider, type GovernanceProvider } from "./provider";

export class GovernanceService {
  constructor(private readonly provider: GovernanceProvider = emptyGovernanceProvider) {}

  getGovernanceRisks(company: Company): Promise<RiskAlert[]> {
    return this.provider.getGovernanceRisks(company);
  }
}

export const governanceService = new GovernanceService();
