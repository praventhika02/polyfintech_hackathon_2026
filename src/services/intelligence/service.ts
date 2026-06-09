import type { CompanyProfile, DataAvailability, EvidenceCollection, EvidenceItem, EvidenceSource } from "@/types";
import type {
  ClassifiedEvidence,
  DataAvailabilityReport,
  DigitalEsgBreakdown,
  ESGIntelligenceResult,
  EsgCategory,
  EvidenceCluster,
  IntelligenceClassification,
  IntelligenceInput,
  InvestorVerdict,
  RiskAlert,
  RiskStatus,
  SentimentLabel
} from "@/types/intelligence";
import { stableId } from "@/utils/ids";
import { evidenceCollectionService } from "@/services/evidence/collection-service";
import { localModelRegistry } from "./model-registry";

const CATEGORY_KEYWORDS: Record<Exclude<EsgCategory, "Non-ESG">, string[]> = {
  Environmental: ["carbon", "climate", "renewable", "pollution", "water", "waste", "net zero", "green finance", "emissions", "energy"],
  Social: ["labour", "labor", "worker", "human rights", "diversity", "community", "safety", "supply chain", "employee", "workplace"],
  Governance: ["board", "executive", "fraud", "corruption", "compliance", "regulatory", "shareholder", "governance", "audit", "filing"],
  "Digital ESG": ["cybersecurity", "cyber", "data privacy", "privacy", "responsible ai", "ai governance", "digital inclusion", "algorithmic bias", "technology risk", "patent", "security"]
};

const POSITIVE_WORDS = ["improve", "improved", "growth", "award", "launch", "commit", "target", "reduce", "renewable", "innovation", "approved", "expands", "progress"];
const NEGATIVE_WORDS = ["risk", "probe", "investigation", "fraud", "breach", "violation", "lawsuit", "fine", "incident", "strike", "controversy", "warning", "corruption"];

const RISK_KEYWORDS: Array<{ category: RiskAlert["category"]; keywords: string[]; high: string[] }> = [
  { category: "Environmental Incident", keywords: ["spill", "pollution", "emissions breach", "environmental incident"], high: ["toxic", "fatal", "major"] },
  { category: "Labour Dispute", keywords: ["strike", "labour dispute", "labor dispute", "worker protest"], high: ["mass", "shutdown"] },
  { category: "Human Rights Issue", keywords: ["human rights", "forced labour", "forced labor", "child labour"], high: ["forced", "child"] },
  { category: "Supply Chain Risk", keywords: ["supply chain risk", "supplier violation", "supply disruption"], high: ["sanction", "forced"] },
  { category: "Governance Scandal", keywords: ["governance scandal", "executive misconduct", "accounting scandal"], high: ["criminal", "resignation"] },
  { category: "Regulatory Investigation", keywords: ["regulatory investigation", "regulatory probe", "enforcement action", "probe", "investigation"], high: ["sec", "criminal", "enforcement"] },
  { category: "Cybersecurity Incident", keywords: ["cybersecurity incident", "cyber attack", "ransomware", "data breach"], high: ["ransomware", "breach"] },
  { category: "Data Privacy Risk", keywords: ["data privacy", "privacy violation", "personal data"], high: ["leak", "breach"] },
  { category: "AI Governance Risk", keywords: ["ai governance", "algorithmic bias", "responsible ai", "ai risk"], high: ["bias", "unsafe"] },
  { category: "Corruption / Fraud", keywords: ["corruption", "fraud", "bribery"], high: ["criminal", "charged"] }
];

const SOURCE_WEIGHTS: Record<EvidenceSource, number> = {
  filings: 1.25,
  patents: 1.15,
  jobs: 1.05,
  news: 1,
  finance: 0.4,
  governance: 1.25,
  manual: 1
};

function textOf(item: EvidenceItem): string {
  return [item.title, item.description, item.excerpt, item.matchedKeywords.join(" "), item.tags.join(" ")].filter(Boolean).join(" ");
}

function countBy<T extends string>(values: T[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function recencyWeight(item: EvidenceItem): number {
  const date = new Date(item.publishedAt || item.capturedAt).getTime();
  const ageDays = Math.max(0, (Date.now() - date) / 86_400_000);
  if (ageDays <= 7) return 1.2;
  if (ageDays <= 30) return 1;
  if (ageDays <= 90) return 0.75;
  return 0.5;
}

function scoreFromWeighted(values: number[]): number | null {
  if (!values.length) return null;
  const max = values.reduce((sum, value) => sum + Math.abs(value), 0) || values.length;
  const raw = values.reduce((sum, value) => sum + value, 0);
  return Math.round(Math.max(0, Math.min(100, ((raw / max) + 1) * 50)));
}

function sentimentValue(label: SentimentLabel): number {
  if (label === "Positive") return 1;
  if (label === "Negative") return -1;
  return 0;
}

function confidenceNumber(item: EvidenceItem): number {
  if (item.confidence === "high") return 0.9;
  if (item.confidence === "medium") return 0.7;
  if (item.confidence === "low") return 0.45;
  return 0.25;
}

function classifyItemByKeywords(item: EvidenceItem): Pick<ClassifiedEvidence, "category" | "classificationConfidence"> {
  const lower = textOf(item).toLowerCase();
  const scores = Object.entries(CATEGORY_KEYWORDS).map(([category, keywords]) => ({
    category: category as Exclude<EsgCategory, "Non-ESG">,
    hits: keywords.filter((keyword) => lower.includes(keyword)).length
  }));
  const best = scores.sort((a, b) => b.hits - a.hits)[0];
  if (!best || best.hits === 0) return { category: "Non-ESG", classificationConfidence: 0.15 };
  return { category: best.category, classificationConfidence: Math.min(0.55, 0.28 + best.hits * 0.06 + confidenceNumber(item) * 0.08) };
}

function sentimentForKeywords(item: EvidenceItem): ClassifiedEvidence["sentiment"] {
  const lower = textOf(item).toLowerCase();
  const positives = POSITIVE_WORDS.filter((word) => lower.includes(word)).length;
  const negatives = NEGATIVE_WORDS.filter((word) => lower.includes(word)).length;
  if (negatives > positives) return { label: "Negative", confidence: Math.min(0.58, 0.38 + negatives * 0.05), method: "keyword_fallback" };
  if (positives > negatives) return { label: "Positive", confidence: Math.min(0.58, 0.38 + positives * 0.04), method: "keyword_fallback" };
  return { label: "Neutral", confidence: 0.45, method: "keyword_fallback" };
}

function clusterEvidence(items: EvidenceItem[]): EvidenceCluster[] {
  const clusters: EvidenceCluster[] = [];
  for (const item of items) {
    const words = new Set(textOf(item).toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 4));
    const match = clusters.find((cluster) => {
      const representative = items.find((candidate) => candidate.id === cluster.representativeEvidenceId);
      if (!representative) return false;
      const repWords = new Set(textOf(representative).toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 4));
      const overlap = [...words].filter((word) => repWords.has(word)).length;
      return overlap / Math.max(1, Math.min(words.size, repWords.size)) >= 0.55;
    });
    if (match) {
      match.evidenceIds.push(item.id);
      match.clusterSize += 1;
    } else {
      clusters.push({
        id: stableId("cluster", item.id),
        topic: item.matchedKeywords[0] || item.tags[0] || item.category,
        representativeEvidenceId: item.id,
        evidenceIds: [item.id],
        clusterSize: 1
      });
    }
  }
  return clusters;
}

function detectRisks(items: EvidenceItem[], classified: ClassifiedEvidence[]): RiskAlert[] {
  return RISK_KEYWORDS.flatMap((risk) => {
    const matches = items.filter((item) => risk.keywords.some((keyword) => textOf(item).toLowerCase().includes(keyword)));
    if (!matches.length) return [];
    const lower = matches.map(textOf).join(" ").toLowerCase();
    const hasHighTerm = risk.high.some((term) => lower.includes(term));
    const regulatory = matches.some((item) => item.source === "filings" || item.source === "governance");
    const confidence = Math.min(0.96, 0.58 + matches.length * 0.08 + (regulatory ? 0.14 : 0));
    const severity = confidence > 0.85 && (hasHighTerm || regulatory) ? "Critical" : confidence > 0.78 || hasHighTerm ? "High" : confidence > 0.65 ? "Medium" : "Low";
    const negativeSignals = classified.filter((item) => matches.some((match) => match.id === item.evidenceId) && item.sentiment.label === "Negative").length;
    return [{
      id: stableId("risk", `${risk.category}_${matches.map((item) => item.id).join("|")}`),
      category: risk.category,
      severity,
      confidence: Number(confidence.toFixed(2)),
      expectedTimeToMarketImpact: severity === "Critical" || negativeSignals > 1 ? "1-3 weeks" : severity === "High" ? "1-3 months" : "3-6 months",
      evidenceIds: matches.map((item) => item.id),
      rationale: `${risk.category} detected from ${matches.length} evidence item(s): ${matches.map((item) => item.id).join(", ")}.`
    } satisfies RiskAlert];
  });
}

function riskStatus(alerts: RiskAlert[]): RiskStatus {
  if (alerts.some((alert) => alert.severity === "Critical")) return "Critical";
  if (alerts.some((alert) => alert.severity === "High") || alerts.length >= 3) return "Alert";
  if (alerts.some((alert) => alert.severity === "Medium") || alerts.length > 0) return "Watch";
  return "Clear";
}

function threshold(items: EvidenceItem[], classified: ClassifiedEvidence[], risks: RiskAlert[]) {
  const esgRelevant = classified.filter((item) => item.category !== "Non-ESG");
  const highRegulatory = items.some((item) => (item.source === "filings" || item.source === "governance") && item.confidence === "high");
  const highRisk = risks.some((risk) => risk.confidence >= 0.75);
  return {
    passed: esgRelevant.length >= 3 || highRegulatory || highRisk,
    reason: esgRelevant.length >= 3
      ? "At least 3 ESG-relevant evidence items are available."
      : highRegulatory
        ? "High-confidence regulatory/governance evidence is available."
        : highRisk
          ? "High-confidence risk evidence is available."
          : "Insufficient ESG-relevant, regulatory, or risk evidence.",
    esgRelevantCount: esgRelevant.length
  };
}

function confidenceScore(items: EvidenceItem[], classified: ClassifiedEvidence[]): number {
  const relevant = classified.filter((item) => item.category !== "Non-ESG");
  const evidenceCountScore = Math.min(100, relevant.length * 18);
  const sourceDiversityScore = Math.min(100, new Set(items.filter((item) => relevant.some((r) => r.evidenceId === item.id)).map((item) => item.source)).size * 24);
  const recencyScore = Math.round(relevant.reduce((sum, item) => sum + item.recencyWeight, 0) / Math.max(1, relevant.length) / 1.2 * 100);
  const modelConfidenceScore = Math.round(relevant.reduce((sum, item) => sum + item.classificationConfidence * item.sentiment.confidence, 0) / Math.max(1, relevant.length) * 100);
  const positive = relevant.filter((item) => item.sentiment.label === "Positive").length;
  const negative = relevant.filter((item) => item.sentiment.label === "Negative").length;
  const signalConsistencyScore = Math.round(Math.abs(positive - negative) / Math.max(1, relevant.length) * 100);
  return Math.round(
    0.3 * evidenceCountScore +
    0.25 * sourceDiversityScore +
    0.2 * recencyScore +
    0.15 * modelConfidenceScore +
    0.1 * signalConsistencyScore
  );
}

function classifyCompany(overall: number, momentum: number, confidence: number, status: RiskStatus): IntelligenceClassification {
  if (status === "Critical") return overall >= 60 ? "Overrated Leader" : "Value Trap";
  if (overall < 60 && momentum > 0 && confidence > 60) return "Hidden Winner";
  if (overall >= 60 && momentum > 0 && confidence > 60) return "Future Leader";
  if (overall < 60 && momentum < 0) return "Value Trap";
  if (overall >= 60 && momentum < 0) return "Overrated Leader";
  if (confidence <= 60) return overall >= 60 ? "Overrated Leader" : "Value Trap";
  return overall >= 60 ? "Future Leader" : "Hidden Winner";
}

function verdictFor(classification: IntelligenceClassification, momentum: number, confidence: number, status: RiskStatus): InvestorVerdict {
  if (status === "Critical" || status === "Alert" || momentum < 0) return "AVOID";
  if ((classification === "Hidden Winner" || classification === "Future Leader") && confidence > 70 && (status === "Clear" || status === "Watch")) return "BUY SIGNAL";
  if (momentum > 0 && confidence >= 50) return "WATCH";
  return "HOLD";
}

function digitalBreakdown(classified: ClassifiedEvidence[], items: EvidenceItem[]): DigitalEsgBreakdown {
  const digital = classified.filter((item) => item.category === "Digital ESG");
  const subscore = (terms: string[]) => {
    const values = digital.filter((item) => {
      const evidence = items.find((candidate) => candidate.id === item.evidenceId);
      return evidence && terms.some((term) => textOf(evidence).toLowerCase().includes(term));
    }).map((item) => item.weightedSignal);
    return scoreFromWeighted(values);
  };
  return {
    score: scoreFromWeighted(digital.map((item) => item.weightedSignal)),
    subscores: {
      cybersecurity: subscore(["cyber", "security", "ransomware"]),
      dataPrivacy: subscore(["privacy", "personal data", "data breach"]),
      aiGovernance: subscore(["ai governance", "responsible ai", "algorithmic bias"]),
      digitalInnovation: subscore(["patent", "technology", "innovation", "digital"]),
      responsibleTechnology: subscore(["responsible", "inclusion", "technology risk"])
    },
    evidenceReasons: digital.map((item) => `Digital ESG signal from evidence ${item.evidenceId}.`)
  };
}

function buildAvailability(company: CompanyProfile, collection: EvidenceCollection, data: ReturnType<typeof threshold>): DataAvailabilityReport {
  const base: DataAvailability = {
    companyId: company.id,
    ticker: company.ticker,
    lastUpdated: collection.collectedAt,
    statuses: collection.statuses,
    evidenceCounts: collection.summary,
    providerHealth: collection.statuses
  };
  return { ...base, meetsMinimumEvidenceThreshold: data.passed, thresholdReason: data.reason, esgRelevantEvidenceCount: data.esgRelevantCount };
}

export class IntelligenceService {
  async classifyEvidence(items: EvidenceItem[]): Promise<ClassifiedEvidence[]> {
    if (!items.length) return [];
    return Promise.all(items.map(async (item) => {
      const text = textOf(item);
      const modelClassification = await localModelRegistry.classifyEsg(text);
      const fallbackClassification = classifyItemByKeywords(item);
      const classification = modelClassification
        ? { category: modelClassification.category, classificationConfidence: modelClassification.confidence }
        : fallbackClassification;
      const modelSentiment = await localModelRegistry.classifySentiment(text);
      const fallbackSentiment = sentimentForKeywords(item);
      const sentiment = modelSentiment
        ? { ...modelSentiment, method: "local_huggingface" as const }
        : fallbackSentiment;
      const classificationMethod = modelClassification ? "local_huggingface" as const : "keyword_fallback" as const;
      const sourceWeight = SOURCE_WEIGHTS[item.source] || 1;
      const recent = recencyWeight(item);
      const weightedSignal = sentimentValue(sentiment.label) * sentiment.confidence * classification.classificationConfidence * sourceWeight * recent;
      return {
        evidenceId: item.id,
        ...classification,
        classificationMethod,
        sentiment,
        weightedSignal: Number(weightedSignal.toFixed(4)),
        sourceWeight,
        recencyWeight: recent,
        modelNames: localModelRegistry.names()
      };
    }));
  }

  async analyse(input: IntelligenceInput): Promise<ESGIntelligenceResult> {
    const collection = Array.isArray(input.evidence)
      ? { companyId: input.company.id, ticker: input.company.ticker, collectedAt: new Date().toISOString(), items: input.evidence, statuses: [], summary: this.summarize(input.evidence) }
      : input.evidence || await evidenceCollectionService.collectCompanyEvidence(input.company);
    const classified = await this.classifyEvidence(collection.items);
    const clusters = clusterEvidence(collection.items);
    const risks = detectRisks(collection.items, classified);
    const thresholdData = threshold(collection.items, classified, risks);
    const availability = buildAvailability(input.company, collection, thresholdData);
    const evidenceSummary = {
      total: collection.items.length,
      bySource: countBy(collection.items.map((item) => item.source)),
      byCategory: countBy(classified.map((item) => item.category)),
      clusters
    };

    if (!thresholdData.passed) {
      return {
        status: "insufficient_evidence",
        company: input.company,
        analysedAt: new Date().toISOString(),
        dataAvailability: availability,
        evidenceSummary,
        scores: null,
        classification: "Insufficient Evidence",
        risk: { status: "Clear", alerts: [] },
        verdict: "INSUFFICIENT DATA",
        explanation: {
          summary: "Insufficient evidence available for reliable ESG intelligence.",
          positiveDrivers: [],
          negativeDrivers: [],
          riskDrivers: [],
          confidenceExplanation: `Insufficient evidence available. Evidence references reviewed: ${collection.items.map((item) => item.id).join(", ") || "none"}.`,
          evidenceReferences: collection.items.map((item) => item.id)
        },
        classifiedEvidence: classified,
        digitalEsg: digitalBreakdown(classified, collection.items)
      };
    }

    const categoryScore = (category: EsgCategory) => scoreFromWeighted(classified.filter((item) => item.category === category).map((item) => item.weightedSignal));
    const environmental = categoryScore("Environmental");
    const social = categoryScore("Social");
    const governance = categoryScore("Governance");
    const digital = categoryScore("Digital ESG");
    const relevant = classified.filter((item) => item.category !== "Non-ESG");
    const overall = scoreFromWeighted(relevant.map((item) => item.weightedSignal)) ?? 50;
    const momentum = Math.round(relevant.reduce((sum, item) => sum + item.weightedSignal, 0) / Math.max(1, relevant.length) * 45);
    const confidence = confidenceScore(collection.items, classified);
    const status = riskStatus(risks);
    const classification = classifyCompany(overall, momentum, confidence, status);
    const verdict = verdictFor(classification, momentum, confidence, status);
    const positives = relevant.filter((item) => item.sentiment.label === "Positive").slice(0, 3);
    const negatives = relevant.filter((item) => item.sentiment.label === "Negative").slice(0, 3);

    return {
      status: "complete",
      company: input.company,
      analysedAt: new Date().toISOString(),
      dataAvailability: availability,
      evidenceSummary,
      scores: { environmental, social, governance, digital, overall, momentum, confidence },
      classification,
      risk: { status, alerts: risks },
      verdict,
      explanation: {
        summary: `${classification} classification is based on ${relevant.length} ESG-relevant evidence item(s): ${relevant.map((item) => item.evidenceId).join(", ")}.`,
        positiveDrivers: positives.map((item) => `${item.category} positive driver from evidence ${item.evidenceId}.`),
        negativeDrivers: negatives.map((item) => `${item.category} negative driver from evidence ${item.evidenceId}.`),
        riskDrivers: risks.slice(0, 3).map((risk) => `${risk.category} ${risk.severity.toLowerCase()} risk from evidence ${risk.evidenceIds.join(", ")}.`),
        confidenceExplanation: `Confidence ${confidence} reflects ${relevant.length} ESG evidence item(s), ${new Set(collection.items.map((item) => item.source)).size} source type(s), recency, model confidence, and signal consistency across evidence ${relevant.map((item) => item.evidenceId).join(", ")}.`,
        evidenceReferences: relevant.map((item) => item.evidenceId)
      },
      classifiedEvidence: classified,
      digitalEsg: digitalBreakdown(classified, collection.items)
    };
  }

  risks(items: EvidenceItem[], classified: ClassifiedEvidence[]): RiskAlert[] {
    return detectRisks(items, classified);
  }

  async health() {
    return localModelRegistry.health();
  }

  private summarize(items: EvidenceItem[]): EvidenceCollection["summary"] {
    return {
      news: items.filter((item) => item.source === "news").length,
      jobs: items.filter((item) => item.source === "jobs").length,
      patents: items.filter((item) => item.source === "patents").length,
      filings: items.filter((item) => item.source === "filings").length,
      governance: items.filter((item) => item.source === "governance").length,
      market: items.filter((item) => item.source === "finance").length
    };
  }
}

export const intelligenceService = new IntelligenceService();
