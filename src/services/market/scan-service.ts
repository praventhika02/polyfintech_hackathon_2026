import type {
  CompanyProfile,
  CountryMomentumSummary,
  EvidenceCollection,
  MarketScanCompanyResult,
  MarketScanRequest,
  MarketScanResult,
  MarketScanType,
  MarketUniverse,
  MarketUniverseCompany,
  RadarSummary,
  SectorMomentumSummary
} from "@/types";
import type { EvidenceSourceStatus } from "@/types/evidence";
import { companyDiscoveryService } from "@/services/company/service";
import { evidenceCollectionService } from "@/services/evidence/collection-service";
import { intelligenceService } from "@/services/intelligence/service";
import { sourceStatus } from "@/utils/evidence";
import { stableId } from "@/utils/ids";

const EXPECTED_SOURCES = ["news", "jobs", "patents", "filings", "governance", "market"] as const;
const DEFAULT_MAX_COMPANIES = 50;
const DEFAULT_CONCURRENCY = 5;
const DEFAULT_COMPANY_TIMEOUT_MS = 30_000;
const SCAN_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const ASEAN_COUNTRIES = ["Singapore", "Malaysia", "Thailand", "Indonesia", "Vietnam", "Philippines"] as const;

type ScanCacheEntry = {
  result: MarketScanResult;
  expiresAt: number;
};

function initialRadar(): RadarSummary {
  return {
    hiddenWinners: [],
    futureLeaders: [],
    valueTraps: [],
    overratedLeaders: [],
    criticalRisks: []
  };
}

function emptyResult(scanId: string, request: MarketScanRequest): MarketScanResult {
  return {
    scanId,
    scanType: request.scanType,
    status: "queued",
    createdAt: new Date().toISOString(),
    progress: { total: 0, analysed: 0, skipped: 0, percent: 0 },
    summary: {
      companiesScanned: 0,
      companiesWithSufficientEvidence: 0,
      hiddenWinners: 0,
      futureLeaders: 0,
      valueTraps: 0,
      overratedLeaders: 0,
      criticalRisks: 0,
      averageMomentum: null,
      averageConfidence: null
    },
    results: [],
    radar: initialRadar(),
    errors: []
  };
}

function scanCacheKey(request: MarketScanRequest): string {
  return stableId("scan_cache", JSON.stringify({
    scanType: request.scanType,
    query: request.query,
    sector: request.sector,
    exchange: request.exchange,
    country: request.country,
    companies: request.companies,
    maxCompanies: request.maxCompanies
  }));
}

function riskPenalty(status: MarketScanCompanyResult["riskStatus"]): number {
  if (status === "Critical") return 50;
  if (status === "Alert") return 25;
  if (status === "Watch") return 10;
  return 0;
}

function average(values: Array<number | null | undefined>): number | null {
  const usable = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!usable.length) return null;
  return Math.round(usable.reduce((sum, value) => sum + value, 0) / usable.length);
}

function dataCoverage(collection: EvidenceCollection): number {
  const available = EXPECTED_SOURCES.filter((source) => collection.summary[source] > 0).length;
  return Math.round((available / EXPECTED_SOURCES.length) * 100);
}

function sourceDiversity(collection: EvidenceCollection): number {
  return EXPECTED_SOURCES.filter((source) => collection.summary[source] > 0).length / EXPECTED_SOURCES.length * 100;
}

function forecastDirection(momentum: number | null): MarketScanCompanyResult["forecastDirection"] {
  if (momentum === null) return "unknown";
  if (momentum > 0) return "positive";
  if (momentum < 0) return "negative";
  return "stable";
}

function opportunityScore(result: MarketScanCompanyResult, collection: EvidenceCollection): number | null {
  if (result.status !== "complete" || result.momentumScore === null || result.confidence === null) return null;
  const normalizedMomentum = Math.max(0, Math.min(100, result.momentumScore + 50));
  const positiveDriverStrength = Math.min(100, result.topPositiveDrivers.length * 34);
  const score =
    0.35 * normalizedMomentum +
    0.25 * result.confidence +
    0.2 * sourceDiversity(collection) +
    0.1 * positiveDriverStrength -
    0.1 * riskPenalty(result.riskStatus);
  return Math.round(Math.max(0, Math.min(100, score)));
}

function hasStrongSource(collection: EvidenceCollection): boolean {
  return collection.items.some((item) => (item.source === "patents" || item.source === "filings" || item.source === "governance") && item.confidence === "high");
}

function qualifiesHiddenWinner(result: MarketScanCompanyResult, collection: EvidenceCollection): boolean {
  const highRisk = result.intelligence?.risk.alerts.some((alert) => alert.severity === "High");
  const criticalRisk = result.riskStatus === "Critical";
  const positiveDrivers = result.topPositiveDrivers.length;
  const negativeDrivers = result.intelligence?.explanation.negativeDrivers.length || 0;
  const evidenceSources = new Set(collection.items.map((item) => item.source)).size;
  return result.classification === "Hidden Winner" &&
    (result.confidence || 0) >= 60 &&
    result.status === "complete" &&
    !criticalRisk &&
    (!highRisk || ((result.confidence || 0) >= 75 && positiveDrivers > negativeDrivers)) &&
    positiveDrivers > negativeDrivers &&
    (evidenceSources >= 2 || hasStrongSource(collection));
}

function rankResults(results: MarketScanCompanyResult[]): MarketScanCompanyResult[] {
  const scored = results
    .filter((result) => result.opportunityScore !== null)
    .sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0))
    .map((result, index) => ({ ...result, rank: index + 1 }));
  const insufficient = results
    .filter((result) => result.opportunityScore === null)
    .map((result) => ({ ...result, rank: null }));
  return [...scored, ...insufficient];
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms.`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function mapLimit<T, R>(items: T[], limit: number, mapper: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export class MarketScanService {
  private readonly scans = new Map<string, MarketScanResult>();
  private readonly cache = new Map<string, ScanCacheEntry>();
  private lastSuccessfulScan: MarketScanResult | null = null;

  async generateUniverse(request: MarketScanRequest): Promise<MarketUniverse> {
    const maxCompanies = Math.min(request.maxCompanies || DEFAULT_MAX_COMPANIES, DEFAULT_MAX_COMPANIES);
    const providerStatuses: EvidenceSourceStatus[] = [];
    const errors: string[] = [];
    const companiesByTicker = new Map<string, MarketUniverseCompany>();

    if (request.scanType === "custom") {
      const inputs = (request.companies || []).slice(0, maxCompanies);
      for (const input of inputs) {
        const resolved = await this.resolveCompany(input);
        providerStatuses.push(...resolved.statuses);
        if (resolved.company) {
          companiesByTicker.set(resolved.company.ticker.toUpperCase(), { ...resolved.company, universeSource: "custom_input", resolvedFrom: input });
        } else {
          errors.push(`Company not found in supported providers: ${input}`);
        }
      }
    } else if (request.scanType === "asean") {
      const perCountryLimit = Math.max(1, Math.floor(maxCompanies / ASEAN_COUNTRIES.length));
      for (const country of ASEAN_COUNTRIES) {
        const universe = await companyDiscoveryService.generateUniverse({ region: country, query: request.query || `${country} public company`, limit: perCountryLimit });
        providerStatuses.push(...universe.statuses);
        universe.companies.forEach((company) => companiesByTicker.set(company.ticker.toUpperCase(), { ...company, country: company.country || country, universeSource: "provider_search" }));
      }
    } else {
      const query = request.query || request.sector || request.exchange || request.country;
      if (!query) {
        errors.push("Universe provider unavailable: query, sector, exchange, or country is required.");
      } else {
        const universe = await companyDiscoveryService.generateUniverse({
          query,
          sectors: request.sector ? [request.sector] : undefined,
          exchange: request.exchange,
          region: request.country,
          limit: maxCompanies
        });
        providerStatuses.push(...universe.statuses);
        universe.companies.forEach((company) => companiesByTicker.set(company.ticker.toUpperCase(), { ...company, universeSource: "provider_search" }));
      }
    }

    if (!companiesByTicker.size && !errors.length) {
      errors.push("Universe provider unavailable");
    }

    return {
      universeId: stableId("universe", JSON.stringify(request)),
      scanType: request.scanType,
      generatedAt: new Date().toISOString(),
      query: request,
      companies: Array.from(companiesByTicker.values()).slice(0, maxCompanies),
      providerStatuses,
      errors
    };
  }

  async runScan(request: MarketScanRequest): Promise<MarketScanResult> {
    const normalized = this.normalizeRequest(request);
    const cacheKey = scanCacheKey(normalized);
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    const scanId = stableId("scan", `${normalized.scanType}:${Date.now()}:${Math.random().toString(36).slice(2)}`);
    const scan = emptyResult(scanId, normalized);
    scan.status = "running";
    scan.startedAt = new Date().toISOString();
    this.scans.set(scanId, scan);

    try {
      const universe = await this.generateUniverse(normalized);
      scan.errors.push(...universe.errors);
      scan.progress.total = universe.companies.length;
      const results = await mapLimit(
        universe.companies,
        normalized.concurrency || DEFAULT_CONCURRENCY,
        async (company) => {
          scan.progress.currentCompany = company.name;
          const result = await this.analyseCompany(company, normalized.companyTimeoutMs || DEFAULT_COMPANY_TIMEOUT_MS);
          if (result.status === "complete") scan.progress.analysed += 1;
          else scan.progress.skipped += 1;
          scan.progress.percent = scan.progress.total ? Math.round(((scan.progress.analysed + scan.progress.skipped) / scan.progress.total) * 100) : 0;
          scan.results = rankResults([...scan.results, result]);
          scan.status = scan.progress.analysed + scan.progress.skipped < scan.progress.total ? "partial" : "running";
          return result;
        }
      );

      scan.results = rankResults(results);
      scan.status = scan.errors.length && results.length ? "partial" : "complete";
      scan.completedAt = new Date().toISOString();
      scan.progress.currentCompany = undefined;
      this.applySummary(scan);
      scan.countrySummaries = normalized.scanType === "asean" ? this.countrySummaries(scan, universe) : undefined;
      scan.sectorSummaries = normalized.scanType === "sector" ? this.sectorSummaries(scan, normalized.sector || normalized.query || "Unknown") : undefined;
      this.cache.set(cacheKey, { result: scan, expiresAt: Date.now() + SCAN_CACHE_TTL_MS });
      if (scan.status === "complete" || scan.status === "partial") this.lastSuccessfulScan = scan;
      return scan;
    } catch (error) {
      scan.status = "failed";
      scan.completedAt = new Date().toISOString();
      scan.errors.push(error instanceof Error ? error.message : "Market scan failed.");
      this.applySummary(scan);
      return scan;
    }
  }

  getScan(scanId: string): MarketScanResult | null {
    return this.scans.get(scanId) || null;
  }

  health() {
    return {
      status: "ok",
      providerAvailability: "Uses live company search and evidence providers; unavailable providers return explicit statuses.",
      lastSuccessfulScan: this.lastSuccessfulScan ? { scanId: this.lastSuccessfulScan.scanId, completedAt: this.lastSuccessfulScan.completedAt } : null,
      scanCache: { entries: this.cache.size, ttlSeconds: SCAN_CACHE_TTL_MS / 1000 },
      universeProviderStatus: "dynamic_provider_search",
      maxCompanies: DEFAULT_MAX_COMPANIES,
      concurrency: DEFAULT_CONCURRENCY
    };
  }

  private normalizeRequest(request: MarketScanRequest): MarketScanRequest {
    return {
      ...request,
      scanType: request.scanType || "search",
      maxCompanies: Math.min(request.maxCompanies || DEFAULT_MAX_COMPANIES, DEFAULT_MAX_COMPANIES),
      concurrency: Math.max(1, Math.min(request.concurrency || DEFAULT_CONCURRENCY, DEFAULT_CONCURRENCY)),
      companyTimeoutMs: request.companyTimeoutMs || DEFAULT_COMPANY_TIMEOUT_MS
    };
  }

  private async resolveCompany(input: string): Promise<{ company: CompanyProfile | null; statuses: EvidenceSourceStatus[] }> {
    const metadata = await companyDiscoveryService.metadata(input);
    if (metadata.company) return { company: metadata.company, statuses: metadata.statuses };
    const search = await companyDiscoveryService.search(input, 1);
    return { company: search.companies[0] || null, statuses: search.providerStatuses };
  }

  private async analyseCompany(company: CompanyProfile, timeoutMs: number): Promise<MarketScanCompanyResult> {
    try {
      return await withTimeout(this.analyseCompanyNow(company), timeoutMs, company.ticker);
    } catch (error) {
      return {
        rank: null,
        company,
        ticker: company.ticker,
        country: company.country,
        sector: company.sector,
        status: "error",
        classification: "Insufficient Evidence",
        verdict: "INSUFFICIENT DATA",
        currentESGSignal: null,
        momentumScore: null,
        forecastDirection: "unknown",
        confidence: null,
        opportunityScore: null,
        riskStatus: "Clear",
        topPositiveDrivers: [],
        topRisks: [],
        evidenceCount: 0,
        evidenceIds: [],
        dataCoverage: 0,
        explanation: "Company analysis failed before evidence-backed intelligence could be produced.",
        error: error instanceof Error ? error.message : "Company analysis failed."
      };
    }
  }

  private async analyseCompanyNow(company: CompanyProfile): Promise<MarketScanCompanyResult> {
    const collection = await evidenceCollectionService.collectCompanyEvidence(company);
    const intelligence = await intelligenceService.analyse({ company, evidence: collection });
    const coverage = dataCoverage(collection);
    const rawConfidence = intelligence.scores?.confidence ?? null;
    const confidence = rawConfidence !== null && coverage < 30 ? Math.min(rawConfidence, Math.round(rawConfidence * (coverage / 30))) : rawConfidence;
    const result: MarketScanCompanyResult = {
      rank: null,
      company,
      ticker: company.ticker,
      country: company.country,
      sector: company.sector,
      status: intelligence.status,
      classification: intelligence.classification,
      verdict: intelligence.verdict,
      currentESGSignal: intelligence.scores?.overall ?? null,
      momentumScore: intelligence.scores?.momentum ?? null,
      forecastDirection: forecastDirection(intelligence.scores?.momentum ?? null),
      confidence,
      opportunityScore: null,
      riskStatus: intelligence.risk.status,
      topPositiveDrivers: intelligence.explanation.positiveDrivers.slice(0, 3),
      topRisks: intelligence.risk.alerts.slice(0, 3).map((alert) => `${alert.category}: ${alert.severity}`),
      evidenceCount: intelligence.evidenceSummary.total,
      evidenceIds: intelligence.explanation.evidenceReferences,
      dataCoverage: coverage,
      explanation: intelligence.explanation.summary,
      intelligence
    };
    result.opportunityScore = opportunityScore(result, collection);
    if (!qualifiesHiddenWinner(result, collection) && result.classification === "Hidden Winner") {
      result.classification = "Insufficient Evidence";
      result.verdict = result.verdict === "BUY SIGNAL" ? "WATCH" : result.verdict;
    }
    return result;
  }

  private applySummary(scan: MarketScanResult): void {
    const sufficient = scan.results.filter((result) => result.status === "complete");
    scan.summary = {
      companiesScanned: scan.results.length,
      companiesWithSufficientEvidence: sufficient.length,
      hiddenWinners: sufficient.filter((result) => result.classification === "Hidden Winner").length,
      futureLeaders: sufficient.filter((result) => result.classification === "Future Leader").length,
      valueTraps: sufficient.filter((result) => result.classification === "Value Trap").length,
      overratedLeaders: sufficient.filter((result) => result.classification === "Overrated Leader").length,
      criticalRisks: sufficient.filter((result) => result.riskStatus === "Critical").length,
      averageMomentum: average(sufficient.map((result) => result.momentumScore)),
      averageConfidence: average(sufficient.map((result) => result.confidence))
    };
    scan.radar = {
      hiddenWinners: scan.results.filter((result) => result.classification === "Hidden Winner").slice(0, 10),
      futureLeaders: scan.results.filter((result) => result.classification === "Future Leader").slice(0, 10),
      valueTraps: scan.results.filter((result) => result.classification === "Value Trap").slice(0, 10),
      overratedLeaders: scan.results.filter((result) => result.classification === "Overrated Leader").slice(0, 10),
      criticalRisks: scan.results.filter((result) => result.riskStatus === "Critical").slice(0, 10)
    };
  }

  private countrySummaries(scan: MarketScanResult, universe: MarketUniverse): CountryMomentumSummary[] {
    const countries = Array.from(new Set(universe.companies.map((company) => company.country).filter((country): country is string => Boolean(country))));
    return countries.map((country) => {
      const results = scan.results.filter((result) => result.country === country);
      return {
        country,
        providerStatus: universe.providerStatuses.find((status) => status.message.includes(country))?.status || "available",
        companiesResolved: universe.companies.filter((company) => company.country === country).length,
        companiesAnalysed: results.filter((result) => result.status === "complete").length,
        companiesSkipped: results.filter((result) => result.status !== "complete").length,
        topHiddenWinners: results.filter((result) => result.classification === "Hidden Winner").slice(0, 3),
        topRisks: results.flatMap((result) => result.topRisks).slice(0, 5),
        averageMomentum: average(results.map((result) => result.momentumScore)),
        dataCoverage: average(results.map((result) => result.dataCoverage)) || 0
      };
    });
  }

  private sectorSummaries(scan: MarketScanResult, sector: string): SectorMomentumSummary[] {
    return [{
      sector,
      companiesResolved: scan.progress.total,
      companiesAnalysed: scan.results.filter((result) => result.status === "complete").length,
      hiddenWinners: scan.results.filter((result) => result.classification === "Hidden Winner").length,
      futureLeaders: scan.results.filter((result) => result.classification === "Future Leader").length,
      valueTraps: scan.results.filter((result) => result.classification === "Value Trap").length,
      overratedLeaders: scan.results.filter((result) => result.classification === "Overrated Leader").length,
      riskAlerts: scan.results.filter((result) => result.riskStatus === "Alert" || result.riskStatus === "Critical").length,
      averageMomentum: average(scan.results.map((result) => result.momentumScore))
    }];
  }
}

export const marketScanService = new MarketScanService();
