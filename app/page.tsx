import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="page landing-hero">
      <section className="hero-band">
        <div className="brand-lockup" style={{ color: "var(--ink)" }}>
          <div className="brand-mark">EA</div>
          <div>
            <strong>ESG Alpha Digital Twin</strong>
            <span style={{ color: "var(--muted)" }}>Forward-looking ESG intelligence</span>
          </div>
        </div>
        <h1>ESG Alpha Digital Twin</h1>
        <p>Predict future ESG momentum using alternative data, AI explanations, and investor-grade signals.</p>
        <div className="form-row" style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
          <Link className="primary-btn" style={{ width: "auto", padding: "0 18px" }} href="/dashboard">Open Dashboard</Link>
          <Link className="secondary-btn" style={{ width: "auto", padding: "0 18px" }} href="/methodology">Methodology</Link>
        </div>
      </section>
    </main>
  );
}
