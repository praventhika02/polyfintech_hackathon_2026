import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { earlyWarnings } from "@/lib/esg/data";

export const dynamic = "force-dynamic";

export default async function EarlyWarningPage() {
  const companies = await earlyWarnings(12);

  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Early Warning</span>
            <h1>Declining ESG signals and controversy risk.</h1>
            <p>Flags companies with negative momentum, fresh ESG risk evidence, or weak data confidence.</p>
          </div>
        </div>
        <section className="warning-grid">
          {companies.map((company) => (
            <Link className="warning-card" href={`/company/${encodeURIComponent(company.ticker)}`} key={company.ticker}>
              <div className="warning-top">
                <AlertTriangle size={20} />
                <span>{company.momentumScore >= 0 ? "Evidence risk" : "Negative momentum"}</span>
              </div>
              <h2>{company.name}</h2>
              <p>{company.risks[0] || "Sparse or inconsistent signals reduced the actionability of this ESG twin."}</p>
              <div className="warning-meta">
                <span>Momentum {company.momentumScore}</span>
                <span>{company.investorSignal} <ArrowUpRight size={14} /></span>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </>
  );
}
