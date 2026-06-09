import { AnalysisView } from "@/components/dashboard/AnalysisView";
import { CompanySearch } from "@/components/dashboard/CompanySearch";
import { AppHeader } from "@/components/layout/AppHeader";
import { analyzeCompany } from "@/lib/esg/data";

export const dynamic = "force-dynamic";

export default async function CompanyPage({ params }: { params: { ticker: string } }) {
  const analysis = await analyzeCompany(decodeURIComponent(params.ticker));

  return (
    <>
      <AppHeader />
      <main className="page">
        <CompanySearch compact defaultValue={decodeURIComponent(params.ticker)} />
        <AnalysisView analysis={analysis} />
      </main>
    </>
  );
}
