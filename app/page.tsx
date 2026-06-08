import Link from "next/link";
import { ArrowRight, Brain, LineChart, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="page">
      <section className="landing-hero">
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
          <Link className="primary-btn" style={{ width: "auto", padding: "0 18px" }} href="/dashboard">Open Dashboard <ArrowRight size={18} /></Link>
          <Link className="secondary-btn" style={{ width: "auto", padding: "0 18px" }} href="/methodology">Methodology</Link>
        </div>
      </section>
      </section>
      <section className="feature-grid">
        {[
          [LineChart, "Momentum, not ratings", "Forecast 12-month ESG direction from live news, market pulse, and alternative-data proxies."],
          [Brain, "Explainable AI", "Every score includes evidence, signal weights, confidence, and risk reasons."],
          [ShieldCheck, "Investor workflow", "Protected watchlists, alert subscriptions, profile settings, and private analysis history schema."]
        ].map(([Icon, title, body]) => (
          <div className="profile-panel" key={title as string}>
            <Icon size={24} />
            <h2>{title as string}</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.65 }}>{body as string}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
