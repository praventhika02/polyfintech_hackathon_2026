export default function MethodologyPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Methodology</h1>
          <p>ESG Alpha focuses on forward-looking momentum, not static annual ratings. Scores combine live news, hiring, patent, governance, trend consistency, source coverage, and recency.</p>
        </div>
      </div>
      <section className="profile-panel">
        <h2>Transparent scoring</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>ESG Momentum Score = 0.35 news ESG sentiment + 0.20 green hiring signal + 0.20 patent innovation signal + 0.15 governance signal + 0.10 trend consistency. This is decision support, not official financial advice.</p>
      </section>
    </main>
  );
}
