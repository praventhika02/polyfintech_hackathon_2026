import { Filter, Radar } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { CompanyCard } from "@/components/cards/CompanyCard";
import { analyzeUniverse } from "@/lib/esg/data";

export const dynamic = "force-dynamic";

export default async function RadarPage() {
  const companies = (await analyzeUniverse(12)).sort((a, b) => b.momentumScore - a.momentumScore);

  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Hidden Winners Radar</span>
            <h1>Companies improving ESG before the market notices.</h1>
            <p>Scans a curated ASEAN and global set, then sorts companies by momentum and confidence. Watchlist companies can be opened directly from the saved list.</p>
          </div>
          <span className="utility-pill chip dark"><Radar size={16} /> Live scan</span>
        </div>
        <div className="button-row">
          {["All", "Hidden Winners", "Future Leaders", "Value Traps", "Overrated Leaders"].map((filter) => <span className="chip" key={filter}><Filter size={13} /> {filter}</span>)}
        </div>
        <section className="watch-grid" style={{ marginTop: 18 }}>
          {companies.map((company) => <CompanyCard company={company} key={company.ticker} />)}
        </section>
      </main>
    </>
  );
}
