import { notFound } from "next/navigation";

export default function CompanyPage({ params }: { params: { ticker: string } }) {
  const ticker = decodeURIComponent(params.ticker || "").toUpperCase();
  if (!ticker) notFound();

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>{ticker} Digital Twin</h1>
          <p>Company-level ESG signal, forecast trajectory, evidence, watchlist actions, and risk context.</p>
        </div>
      </div>
      <section className="grid">
        <div className="card"><span>Current score</span><strong>71</strong></div>
        <div className="card"><span>Forecast</span><strong>79</strong></div>
        <div className="card"><span>Momentum</span><strong>+14</strong></div>
        <div className="card"><span>Action</span><strong>Watch</strong></div>
      </section>
    </main>
  );
}
