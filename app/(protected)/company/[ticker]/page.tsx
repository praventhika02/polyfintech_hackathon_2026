import { notFound } from "next/navigation";
import { ForecastChart } from "@/components/charts/ForecastChart";
import { analyzeCompany } from "@/lib/esg/data";

export default async function CompanyPage({ params }: { params: { ticker: string } }) {
  const ticker = decodeURIComponent(params.ticker || "").toUpperCase();
  if (!ticker) notFound();
  const analysis = await analyzeCompany(ticker);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>{analysis.name} Digital Twin</h1>
          <p>{analysis.ticker} · {analysis.sector} · {analysis.country} · Updated {new Date(analysis.updatedAt).toLocaleString("en-SG")}</p>
        </div>
        <span className="signal-pill">{analysis.classification}</span>
      </div>
      <section className="grid">
        <div className="card"><span>Current score</span><strong>{analysis.currentScore}</strong></div>
        <div className="card"><span>12-month forecast</span><strong>{analysis.forecastScore}</strong></div>
        <div className="card"><span>Momentum</span><strong>{analysis.momentumScore > 0 ? "+" : ""}{analysis.momentumScore}</strong></div>
        <div className="card"><span>Investor action</span><strong>{analysis.investorSignal}</strong></div>
      </section>
      <section className="dashboard-layout" style={{ marginTop: 18 }}>
        <div className="profile-panel">
          <h2>Forecast trajectory</h2>
          <ForecastChart data={analysis.forecast} />
        </div>
        <div className="profile-panel">
          <h2>Signal coverage</h2>
          <div className="list">
            {Object.entries(analysis.coverage).map(([key, value]) => (
              <div className="list-row" key={key}><span>{key}</span><strong>{value ? "Live" : key === "satellite" ? "API required" : "Proxy"}</strong></div>
            ))}
          </div>
        </div>
      </section>
      <section className="dashboard-layout" style={{ marginTop: 18 }}>
        <div className="profile-panel">
          <h2>Explainable ESG AI</h2>
          <div className="list">
            {analysis.explanation.map((item) => <div className="list-row" key={item}>{item}</div>)}
          </div>
        </div>
        <div className="profile-panel">
          <h2>Signal breakdown</h2>
          <div className="bars-list">
            {Object.entries(analysis.signals).map(([label, value]) => (
              <div className="bar-row" key={label}>
                <span>{label}</span>
                <div className="bar-track"><i style={{ width: `${value}%` }} /></div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="dashboard-layout" style={{ marginTop: 18 }}>
        <div className="profile-panel">
          <h2>Live evidence</h2>
          <div className="list">
            {analysis.news.length ? analysis.news.slice(0, 8).map((article) => (
              <a className="list-row" href={article.url} target="_blank" rel="noreferrer" key={article.url || article.title}>
                <div>
                  <strong>{article.title}</strong>
                  <span style={{ display: "block", color: "var(--muted)" }}>{article.category} · {article.source} · tone {article.tone.toFixed(1)}</span>
                </div>
              </a>
            )) : <p style={{ color: "var(--muted)" }}>No live ESG articles were returned by GDELT for this query.</p>}
          </div>
        </div>
        <div className="profile-panel">
          <h2>Early warnings</h2>
          <div className="list">
            {analysis.risks.length ? analysis.risks.map((risk) => <div className="list-row" key={risk}>{risk}</div>) : <p style={{ color: "var(--muted)" }}>No major ESG risk evidence detected in fetched sources.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
