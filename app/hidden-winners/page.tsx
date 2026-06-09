import Link from "next/link";
import { ArrowUpRight, Filter, Trophy } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { hiddenWinners } from "@/lib/esg/data";

export const dynamic = "force-dynamic";

export default async function HiddenWinnersPage() {
  const companies = await hiddenWinners(12);

  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Hidden Winners Radar</span>
            <h1>Low to medium ESG, improving fast.</h1>
            <p>Ranks companies where current ESG is not yet elite but forward momentum and confidence are rising.</p>
          </div>
          <span className="utility-pill"><Filter size={16} /> Sector · Country · Market cap</span>
        </div>
        <section className="table-panel">
          <div className="table-row table-head">
            <span>Company</span><span>Class</span><span>Current</span><span>Momentum</span><span>Signal</span>
          </div>
          {companies.length ? companies.map((company) => (
            <Link className="table-row" href={`/company/${encodeURIComponent(company.ticker)}`} key={company.ticker}>
              <span><b>{company.name}</b><small>{company.ticker} · {company.sector}</small></span>
              <span><Trophy size={16} /> {company.classification}</span>
              <span>{company.currentScore}</span>
              <span className="positive">+{company.momentumScore}</span>
              <span>{company.investorSignal} <ArrowUpRight size={15} /></span>
            </Link>
          )) : (
            <div className="empty-state">
              <strong>No hidden winners in the latest scan</strong>
              <p>Live evidence may be sparse or the selected universe may already be highly rated. Search a company directly for a fresh scan.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
