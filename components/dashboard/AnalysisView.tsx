import Link from "next/link";
import { AlertTriangle, BriefcaseBusiness, Gauge, Lightbulb, LineChart, Radar, ShieldCheck, TrendingUp } from "lucide-react";
import { ForecastChart } from "@/components/charts/ForecastChart";
import { EvidenceList } from "@/components/dashboard/EvidenceList";
import { MomentumMatrix } from "@/components/dashboard/MomentumMatrix";
import { SignalCard } from "@/components/dashboard/SignalCard";
import type { ESGAnalysis } from "@/lib/esg/types";

function signalTone(signal: ESGAnalysis["investorSignal"]) {
  if (signal === "Buy") return "positive";
  if (signal === "Avoid") return "danger";
  if (signal === "Watch") return "warning";
  return "neutral";
}

export function AnalysisView({ analysis }: { analysis: ESGAnalysis }) {
  return (
    <div className="analysis-stack">
      <div className="company-strip">
        <div>
          <span className="eyebrow">Living ESG Digital Twin</span>
          <h1>{analysis.name}</h1>
          <p>
            {analysis.ticker} · {analysis.exchange || "Global"} · {analysis.sector || "Public company"}
          </p>
        </div>
        <Link className="secondary-btn fit" href={`/company/${encodeURIComponent(analysis.ticker)}`}>
          Full intelligence
        </Link>
      </div>

      <section className="metric-grid">
        <SignalCard icon={Gauge} label="Current ESG Signal" value={analysis.currentScore} detail="Weighted live evidence score" />
        <SignalCard icon={TrendingUp} label="12-Month Forecast" value={analysis.forecastScore} detail={`${analysis.momentumScore >= 0 ? "+" : ""}${analysis.momentumScore} momentum`} tone={analysis.momentumScore >= 0 ? "positive" : "danger"} />
        <SignalCard icon={ShieldCheck} label="Confidence" value={`${analysis.confidenceScore}%`} detail="Coverage, recency, consistency" />
        <SignalCard icon={Radar} label="Investor Signal" value={analysis.investorSignal} detail={analysis.classification} tone={signalTone(analysis.investorSignal)} />
      </section>

      <section className="dashboard-layout">
        <div className="panel">
          <div className="section-title">
            <LineChart size={20} />
            <h2>Forward ESG Trajectory</h2>
          </div>
          <ForecastChart data={analysis.forecast} />
        </div>
        <div className="panel">
          <div className="section-title">
            <Lightbulb size={20} />
            <h2>AI Explanation</h2>
          </div>
          <ul className="insight-list">
            {analysis.explanation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="dashboard-layout">
        <div className="panel">
          <div className="section-title">
            <Radar size={20} />
            <h2>ESG Momentum Matrix</h2>
          </div>
          <MomentumMatrix active={analysis.classification} />
        </div>
        <div className="panel">
          <div className="section-title">
            <BriefcaseBusiness size={20} />
            <h2>Alternative Data</h2>
          </div>
          <div className="signal-bars">
            {Object.entries(analysis.signals).map(([label, value]) => (
              <div className="bar-row" key={label}>
                <span>{label}</span>
                <div className="bar-track"><i style={{ width: `${value}%` }} /></div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="coverage-grid">
            <span className={analysis.coverage.news ? "ok" : ""}>News</span>
            <span className={analysis.coverage.jobs ? "ok" : ""}>Jobs</span>
            <span className={analysis.coverage.patents ? "ok" : ""}>Patents</span>
            <span className={analysis.coverage.market ? "ok" : ""}>Market</span>
            <span>Satellite API required</span>
          </div>
        </div>
      </section>

      <section className="dashboard-layout">
        <div className="panel">
          <div className="section-title">
            <ShieldCheck size={20} />
            <h2>News Evidence</h2>
          </div>
          <EvidenceList analysis={analysis} />
        </div>
        <div className="panel">
          <div className="section-title">
            <AlertTriangle size={20} />
            <h2>Risk Alerts</h2>
          </div>
          {analysis.risks.length ? (
            <ul className="risk-list">
              {analysis.risks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <strong>No severe warning in current evidence</strong>
              <p>Risk alerts update when live ESG controversy, labour, governance, or environmental evidence appears.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
