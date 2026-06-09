import { redirect } from "next/navigation";
import { CompanySearch } from "@/components/dashboard/CompanySearch";
import { AppHeader } from "@/components/layout/AppHeader";

export default function InvestigatePage({ searchParams }: { searchParams?: { q?: string } }) {
  const query = searchParams?.q?.trim();
  if (query) redirect(`/investigate/${encodeURIComponent(query)}`);

  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Investor Mission Mode</span>
            <h1>Search any public company.</h1>
            <p>Run a six-mission ESG investigation that collects evidence, scores momentum, checks red flags, evaluates digital ESG, and produces an investor verdict.</p>
          </div>
        </div>
        <CompanySearch />
        <section className="grid-3">
          <article className="card">
            <h3>Momentum Tracker</h3>
            <p>Find whether ESG signals are improving right now, before annual disclosures catch up.</p>
          </article>
          <article className="card">
            <h3>Red Flag Radar</h3>
            <p>Surface governance, labour, environmental, and controversy signals from public evidence.</p>
          </article>
          <article className="card">
            <h3>ESG Time Machine</h3>
            <p>Stress-test the next 12 months using scenario sliders and computed forecast lines.</p>
          </article>
        </section>
      </main>
    </>
  );
}
