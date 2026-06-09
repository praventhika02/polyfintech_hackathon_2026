import { AnalysisView } from "@/components/dashboard/AnalysisView";
import { CompanySearch } from "@/components/dashboard/CompanySearch";
import { AppHeader } from "@/components/layout/AppHeader";
import { analyzeCompany } from "@/lib/esg/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams?: { q?: string } }) {
  const query = searchParams?.q?.trim() || "DBS Group Holdings";
  const analysis = await analyzeCompany(query);

  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Dashboard</span>
            <h1>Search any listed company.</h1>
            <p>Run a live ESG momentum scan using public evidence, transparent scoring, and confidence-aware fallbacks.</p>
          </div>
        </div>
        <CompanySearch defaultValue={searchParams?.q || ""} />
        <AnalysisView analysis={analysis} />
      </main>
    </>
  );
}
