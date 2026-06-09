import { AppHeader } from "@/components/layout/AppHeader";
import { scoringWeights } from "@/lib/esg/config";

const sources = [
  ["News", "GDELT live article search for ESG, climate, governance, labour, and transition evidence."],
  ["Company and market", "Yahoo Finance search and chart endpoints for listed-company discovery and market trend proxy."],
  ["Jobs", "Adzuna API when ADZUNA_APP_ID and ADZUNA_APP_KEY are configured."],
  ["Patents", "PatentsView green innovation search, with unavailable state if the public endpoint rejects the query."],
  ["Satellite", "Future-ready module. The UI marks this as API required and does not fake detection."]
];

export default function MethodologyPage() {
  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Methodology</span>
            <h1>Forward-looking ESG intelligence, not financial advice.</h1>
            <p>ESG Alpha estimates momentum using transparent signal weights, live evidence where possible, and confidence scores that fall when data coverage is weak.</p>
          </div>
        </div>
        <section className="method-grid">
          <article className="panel">
            <h2>Scoring Formula</h2>
            <ul className="insight-list">
              <li>News ESG sentiment: {scoringWeights.newsEsgSentiment * 100}%</li>
              <li>Green job hiring signal: {scoringWeights.greenJobHiringSignal * 100}%</li>
              <li>Patent innovation signal: {scoringWeights.patentInnovationSignal * 100}%</li>
              <li>Governance signal: {scoringWeights.governanceSignal * 100}%</li>
              <li>Trend consistency: {scoringWeights.trendConsistency * 100}%</li>
            </ul>
          </article>
          <article className="panel">
            <h2>Confidence Score</h2>
            <p>Confidence increases with news, jobs, patents, and market coverage. It decreases when live evidence is sparse or controversy signals dominate the article window.</p>
          </article>
          {sources.map(([title, body]) => (
            <article className="panel" key={title}>
              <h2>{title}</h2>
              <p>{body}</p>
            </article>
          ))}
          <article className="panel">
            <h2>Limitations</h2>
            <p>This is a hackathon-grade decision support tool. It does not produce official ESG ratings, legal advice, or investment advice. API access, article quality, and public-company naming differences can affect outputs.</p>
          </article>
        </section>
      </main>
    </>
  );
}
