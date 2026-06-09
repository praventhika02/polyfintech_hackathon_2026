import { CompanySearch } from "@/components/dashboard/CompanySearch";
import { AppHeader } from "@/components/layout/AppHeader";
import { MissionMode } from "@/components/mission/MissionMode";
import { analyzeCompany } from "@/lib/esg/data";

export const dynamic = "force-dynamic";

export default async function MissionPage({ params }: { params: { company: string } }) {
  const company = decodeURIComponent(params.company);
  const analysis = await analyzeCompany(company);

  return (
    <>
      <AppHeader />
      <main className="page">
        <CompanySearch compact defaultValue={company} />
        <MissionMode analysis={analysis} />
      </main>
    </>
  );
}
