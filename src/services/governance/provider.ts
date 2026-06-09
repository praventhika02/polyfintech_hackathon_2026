import type { Company, RiskAlert } from "@/types";

export type GovernanceProvider = {
  getGovernanceRisks(company: Company): Promise<RiskAlert[]>;
};

export const emptyGovernanceProvider: GovernanceProvider = {
  async getGovernanceRisks() {
    return [];
  }
};
