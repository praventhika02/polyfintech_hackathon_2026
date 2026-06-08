import Link from "next/link";
import { analyzeUniverse } from "@/lib/esg/data";

export default async function EarlyWarningPage() {
  const universe = await analyzeUniverse(12);
  const risks = universe.filter((company) => company.risks.length || company.momentumScore < 0);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Early Warning</h1>
          <p>Risk subscriptions monitor ESG momentum deterioration, governance controversies, and adverse alternative-data evidence.</p>
        </div>
      </div>
      <section className="grid">
        <div className="card"><span>Open risk alerts</span><strong>{risks.length}</strong></div>
        <div className="card"><span>Negative momentum</span><strong>{universe.filter((company) => company.momentumScore < 0).length}</strong></div>
        <div className="card"><span>Evidence flags</span><strong>{universe.reduce((sum, company) => sum + company.risks.length, 0)}</strong></div>
        <div className="card"><span>Universe scanned</span><strong>{universe.length}</strong></div>
      </section>
      <section className="profile-panel" style={{ marginTop: 18 }}>
        <h2>Risk reason breakdown</h2>
        <div className="list">
          {risks.map((company) => (
            <Link className="list-row" href={`/company/${encodeURIComponent(company.ticker)}`} key={company.ticker}>
              <div>
                <strong>{company.name}</strong>
                <span style={{ display: "block", color: "var(--muted)" }}>{company.risks[0] || `Momentum declining at ${company.momentumScore}`}</span>
              </div>
              <strong>{company.momentumScore}</strong>
            </Link>
          ))}
          {!risks.length ? <p style={{ color: "var(--muted)" }}>No live early-warning risks detected in the current scan.</p> : null}
        </div>
      </section>
    </main>
  );
}
