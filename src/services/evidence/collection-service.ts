import type { CompanyProfile, DataAvailability, EvidenceCollection, EvidenceSourceStatus } from "@/types";
import { filingsService } from "@/services/filings/service";
import { financeService } from "@/services/finance/service";
import { governanceService } from "@/services/governance/service";
import { jobsService } from "@/services/jobs/service";
import { newsService } from "@/services/news/service";
import { patentsService } from "@/services/patents/service";
import { evidenceRepository } from "@/services/storage/evidence-repository";

function summarize(collectionItems: EvidenceCollection["items"]): EvidenceCollection["summary"] {
  return {
    news: collectionItems.filter((item) => item.source === "news").length,
    jobs: collectionItems.filter((item) => item.source === "jobs").length,
    patents: collectionItems.filter((item) => item.source === "patents").length,
    filings: collectionItems.filter((item) => item.source === "filings").length,
    governance: collectionItems.filter((item) => item.source === "governance").length,
    market: collectionItems.filter((item) => item.source === "finance").length
  };
}

export class EvidenceCollectionService {
  async collectCompanyEvidence(company: CompanyProfile): Promise<EvidenceCollection> {
    await evidenceRepository.saveCompany(company);
    const [news, jobs, patents, filings, market] = await Promise.all([
      newsService.getCompanyEvidence(company),
      jobsService.getJobEvidence(company),
      patentsService.getPatentEvidence(company),
      filingsService.getFilingEvidence(company),
      financeService.getMarketEvidence(company)
    ]);
    const governance = governanceService.extractGovernanceEvidence(company, [...news.items, ...filings.items]);
    const items = [...news.items, ...jobs.items, ...patents.items, ...filings.items, ...market.items, ...governance.items];
    const statuses = [...news.statuses, ...jobs.statuses, ...patents.statuses, ...filings.statuses, ...market.statuses, ...governance.statuses];
    const collection: EvidenceCollection = {
      companyId: company.id,
      ticker: company.ticker,
      collectedAt: new Date().toISOString(),
      items,
      statuses,
      summary: summarize(items)
    };
    await evidenceRepository.saveCollection(collection);
    return collection;
  }

  async availability(company: CompanyProfile): Promise<DataAvailability> {
    const collection = await this.collectCompanyEvidence(company);
    return {
      companyId: company.id,
      ticker: company.ticker,
      lastUpdated: collection.collectedAt,
      statuses: collection.statuses,
      evidenceCounts: collection.summary,
      providerHealth: collection.statuses
    };
  }

  async providerHealth(): Promise<EvidenceSourceStatus[]> {
    const collection = await this.collectCompanyEvidence({
      id: "provider_health_probe",
      name: "Microsoft",
      ticker: "MSFT",
      dataProvider: "System",
      metadataConfidence: 1
    });
    return collection.statuses;
  }
}

export const evidenceCollectionService = new EvidenceCollectionService();
