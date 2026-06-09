import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CompanyProfile, EvidenceCollection, EvidenceItem, EvidenceSourceStatus } from "@/types";

type EvidenceRepository = {
  saveCompany(company: CompanyProfile): Promise<void>;
  saveEvidence(items: EvidenceItem[]): Promise<void>;
  saveProviderStatuses(statuses: EvidenceSourceStatus[]): Promise<void>;
  saveCollection(collection: EvidenceCollection): Promise<void>;
  listEvidence(ticker: string): Promise<EvidenceItem[]>;
};

const memoryEvidence = new Map<string, EvidenceItem[]>();
const memoryCompanies = new Map<string, CompanyProfile>();
const memoryProviderStatuses: EvidenceSourceStatus[] = [];

function supabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export class RuntimeEvidenceRepository implements EvidenceRepository {
  private readonly supabase = supabaseClient();

  async saveCompany(company: CompanyProfile): Promise<void> {
    memoryCompanies.set(company.ticker.toUpperCase(), company);
    if (!this.supabase) return;
    await this.supabase.from("companies").upsert(
      {
        id: company.id,
        ticker: company.ticker,
        name: company.name,
        exchange: company.exchange,
        country: company.country,
        sector: company.sector,
        industry: company.industry,
        market_cap: company.marketCap,
        currency: company.currency,
        website: company.website,
        business_summary: company.description,
        employee_count: company.employeeCount,
        data_provider: company.dataProvider,
        metadata_confidence: company.metadataConfidence,
        search_aliases: company.searchAliases || [],
        updated_at: new Date().toISOString()
      },
      { onConflict: "ticker" }
    );
  }

  async saveEvidence(items: EvidenceItem[]): Promise<void> {
    items.forEach((item) => {
      if (!item.ticker) return;
      const key = item.ticker.toUpperCase();
      const existing = memoryEvidence.get(key) || [];
      memoryEvidence.set(key, [...existing.filter((stored) => stored.id !== item.id), item]);
    });

    if (!this.supabase || !items.length) return;
    await this.supabase.from("evidence").upsert(
      items.map((item) => ({
        id: item.id,
        company_id: item.companyId,
        ticker: item.ticker,
        source: item.source,
        provider: item.provider,
        category: item.category,
        title: item.title,
        description: item.description,
        url: item.url,
        publisher: item.publisher,
        published_at: item.publishedAt,
        captured_at: item.capturedAt,
        excerpt: item.excerpt,
        reliability: item.reliability,
        confidence: item.confidence,
        matched_keywords: item.matchedKeywords,
        tags: item.tags,
        raw_metadata: item.rawMetadata
      })),
      { onConflict: "id" }
    );
  }

  async saveProviderStatuses(statuses: EvidenceSourceStatus[]): Promise<void> {
    memoryProviderStatuses.push(...statuses);
    if (!this.supabase || !statuses.length) return;
    await this.supabase.from("provider_health").insert(
      statuses.map((status) => ({
        source: status.source,
        provider: status.provider,
        status: status.status,
        evidence_count: status.evidenceCount,
        message: status.message,
        checked_at: status.checkedAt,
        cache_ttl_seconds: status.cacheTtlSeconds
      }))
    );
  }

  async saveCollection(collection: EvidenceCollection): Promise<void> {
    await this.saveEvidence(collection.items);
    await this.saveProviderStatuses(collection.statuses);
  }

  async listEvidence(ticker: string): Promise<EvidenceItem[]> {
    const key = ticker.toUpperCase();
    if (this.supabase) {
      const { data } = await this.supabase.from("evidence").select("*").eq("ticker", key).order("captured_at", { ascending: false });
      if (data?.length) {
        return data.map((row) => ({
          id: String(row.id),
          source: row.source,
          provider: row.provider,
          category: row.category,
          companyId: row.company_id || undefined,
          ticker: row.ticker || undefined,
          title: row.title,
          description: row.description || undefined,
          url: row.url || undefined,
          publisher: row.publisher || undefined,
          publishedAt: row.published_at || undefined,
          capturedAt: row.captured_at,
          excerpt: row.excerpt || undefined,
          reliability: Number(row.reliability),
          confidence: row.confidence,
          matchedKeywords: Array.isArray(row.matched_keywords) ? row.matched_keywords : [],
          tags: Array.isArray(row.tags) ? row.tags : [],
          rawMetadata: typeof row.raw_metadata === "object" && row.raw_metadata ? row.raw_metadata : {}
        }));
      }
    }
    return memoryEvidence.get(key) || [];
  }
}

export const evidenceRepository = new RuntimeEvidenceRepository();
