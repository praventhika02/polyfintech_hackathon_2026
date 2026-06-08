export default function MethodologyPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Methodology</h1>
          <p>ESG Alpha focuses on forward-looking momentum, not static annual ratings. Scores combine live news, hiring, patent, governance, trend consistency, source coverage, and recency.</p>
        </div>
      </div>
      <section className="method-grid">
        {[
          ["Data sources", "GDELT live news and Yahoo Finance chart data are used immediately. Adzuna, PatentsView, OpenAI, HuggingFace, and satellite providers are optional key-based connectors."],
          ["Scoring formula", "ESG Momentum Score = 0.35 news ESG sentiment + 0.20 green hiring signal + 0.20 patent innovation signal + 0.15 governance signal + 0.10 trend consistency."],
          ["Confidence", "Confidence increases with source coverage, article volume, signal consistency, recency, and market availability. Missing connectors lower confidence instead of fabricating data."],
          ["Limitations", "This is forward-looking ESG intelligence and investor decision support, not official ESG ratings, legal advice, or financial advice."]
        ].map(([title, body]) => (
          <div className="profile-panel" key={title}>
            <h2>{title}</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
