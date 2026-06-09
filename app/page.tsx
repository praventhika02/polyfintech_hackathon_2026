import Link from "next/link";
import { ArrowRight, Brain, DatabaseZap, LineChart, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";

const features = [
  ["Momentum, not static ratings", "Forecast where ESG is going before annual reports catch up.", LineChart],
  ["Alternative data intelligence", "GDELT news, Yahoo market trend, Adzuna jobs, and PatentsView connectors.", DatabaseZap],
  ["Explainable AI outputs", "Each score shows evidence, weights, confidence, risks, and investor action.", Brain],
  ["Early warning radar", "Detect governance, labour, environmental, and regulatory deterioration.", ShieldCheck]
];

export default function LandingPage() {
  return (
    <>
      <AppHeader />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">CGSI ESG & AI · PolyFinTech100 2026</span>
            <h1>ESG Alpha Digital Twin</h1>
            <p>Don&apos;t measure ESG. Predict it. A live AI intelligence platform for finding hidden ESG improvers before traditional ratings update.</p>
            <div className="button-row">
              <Link className="primary-btn fit" href="/dashboard">
                Open Dashboard <ArrowRight size={18} />
              </Link>
              <Link className="secondary-btn fit" href="/methodology">View Methodology</Link>
            </div>
          </div>
          <div className="hero-terminal">
            <div className="terminal-top"><span /><span /><span /></div>
            <div className="score-orbit">
              <strong>+18</strong>
              <span>ESG Momentum</span>
            </div>
            <div className="terminal-lines">
              <p><b>Signal:</b> renewable capex + green hiring acceleration</p>
              <p><b>Risk:</b> no severe controversy in latest evidence window</p>
              <p><b>Action:</b> Watch for hidden-winner confirmation</p>
            </div>
          </div>
        </section>

        <section className="band">
          <div className="section-heading">
            <span className="eyebrow">Investor Problem</span>
            <h2>Traditional ESG ratings are too slow for active decisions.</h2>
            <p>ESG Alpha estimates future momentum from live evidence so investors can compare improvers, leaders, traps, and declining names with clear reasoning.</p>
          </div>
          <div className="feature-grid">
            {features.map(([title, body, Icon]) => (
              <article className="feature-card" key={title as string}>
                <Icon size={23} />
                <h3>{title as string}</h3>
                <p>{body as string}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
