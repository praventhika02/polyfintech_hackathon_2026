import Link from "next/link";
import { analyzeUniverse } from "@/lib/esg/data";

export default async function HiddenWinnersPage() {
  const universe = await analyzeUniverse(12);
  const rows = universe.filter((company) => company.classification === "Hidden Winner" || company.momentumScore > 8);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Hidden Winners</h1>
          <p>Low to medium current ESG signal with strong positive forward momentum.</p>
        </div>
      </div>
      <section className="profile-panel">
        <div className="list">
          {rows.map((company, index) => (
            <Link className="list-row" href={`/company/${encodeURIComponent(company.ticker)}`} key={company.ticker}>
              <div><strong>{index + 1}. {company.name}</strong><span style={{ display: "block", color: "var(--muted)" }}>{company.sector} · current {company.currentScore} · forecast {company.forecastScore} · confidence {company.confidenceScore}%</span></div>
              <strong>+{company.momentumScore}</strong>
            </Link>
          ))}
          {!rows.length ? <p style={{ color: "var(--muted)" }}>No hidden winners detected in the current live universe sample.</p> : null}
        </div>
      </section>
    </main>
  );
}
