export default function EarlyWarningPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Early Warning</h1>
          <p>Risk subscriptions monitor ESG momentum deterioration, governance controversies, and adverse alternative-data evidence.</p>
        </div>
      </div>
      <section className="grid">
        <div className="card"><span>Open risk alerts</span><strong>3</strong></div>
        <div className="card"><span>Governance severity</span><strong>Med</strong></div>
        <div className="card"><span>Environmental incidents</span><strong>1</strong></div>
        <div className="card"><span>Watchlist exposure</span><strong>2</strong></div>
      </section>
    </main>
  );
}
