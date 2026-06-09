import { AppHeader } from "@/components/layout/AppHeader";
import { scoringWeights } from "@/lib/esg/config";

const modules = [
  ["Momentum Tracker", "Answers whether ESG is improving right now by combining ESG news sentiment, green hiring, innovation, governance, and trend consistency."],
  ["Red Flag Radar", "Flags controversy evidence from fetched article titles and category-specific risk terms. Missing sources are skipped silently."],
  ["Digital ESG Score", "Treats hiring velocity, patent innovation, and digital/trend risk as a fourth ESG pillar."],
  ["ESG Time Machine", "Projects scenarios from current score, computed momentum, digital modifier, and risk drag."]
];

const sources = [
  ["Yahoo Finance", "Company search, ticker resolution, sector metadata, and three-month market trend proxy."],
  ["GDELT", "Public global news search for ESG, climate, governance, labour, and transition evidence."],
  ["Adzuna", "Optional sustainability hiring signal when API credentials are configured."],
  ["PatentsView", "Green innovation patent search. If unavailable, confidence is reduced."],
  ["Regulatory RSS", "Designed as an optional connector class; the UI does not fake filings when a source is absent."]
];

export default function MethodologyPage() {
  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Methodology</span>
            <h1>Transparent ESG momentum scoring.</h1>
            <p>ESG Pulse 360 is a proof of concept for forward-looking investor intelligence. It computes every score at runtime from public evidence and confidence-aware fallbacks. It is not financial advice.</p>
          </div>
        </div>

        <section className="method-grid">
          <article className="panel">
            <h2>The Four Modules</h2>
            <ul className="insight-list">
              {modules.map(([title, body]) => <li key={title}><strong>{title}</strong><br />{body}</li>)}
            </ul>
          </article>
          <article className="panel">
            <h2>Scoring Weights</h2>
            <ul className="insight-list">
              <li>News ESG sentiment: {scoringWeights.newsEsgSentiment * 100}%</li>
              <li>Green job hiring signal: {scoringWeights.greenJobHiringSignal * 100}%</li>
              <li>Patent innovation signal: {scoringWeights.patentInnovationSignal * 100}%</li>
              <li>Governance signal: {scoringWeights.governanceSignal * 100}%</li>
              <li>Trend consistency: {scoringWeights.trendConsistency * 100}%</li>
            </ul>
          </article>
          <article className="panel">
            <h2>Models and Logic</h2>
            <p>The prompt calls for local HuggingFace models in a full backend. This repo implements a Next.js proof-of-concept scoring engine using transparent deterministic classifiers, public APIs, and no external LLM APIs. The scoring code lives in <code>lib/esg/scoring.ts</code>.</p>
          </article>
          <article className="panel">
            <h2>Data Sources</h2>
            <ul className="insight-list">
              {sources.map(([title, body]) => <li key={title}><strong>{title}</strong><br />{body}</li>)}
            </ul>
          </article>
          <article className="panel">
            <h2>Digital ESG</h2>
            <p>Digital ESG is computed from green hiring, patent innovation, and trend consistency. A high score means transformation appears to support the ESG trajectory; a low score means it is treated as a liability or uncertainty.</p>
          </article>
          <article className="panel">
            <h2>What It Does Not Do</h2>
            <p>No OpenAI, Anthropic, or external LLM API is used for scoring. Missing API keys do not create fake evidence. The app lowers confidence or skips the source instead.</p>
          </article>
        </section>
      </main>
    </>
  );
}
