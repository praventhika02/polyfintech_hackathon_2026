import Link from "next/link";
import { ArrowUpRight, Gauge, Radar } from "lucide-react";
import type { ESGAnalysis } from "@/lib/esg/types";

export function CompanyCard({ company }: { company: ESGAnalysis }) {
  const hidden = company.classification === "Hidden Winner";
  return (
    <Link className={`card company-card ${hidden ? "hidden" : ""}`} href={`/investigate/${encodeURIComponent(company.ticker)}`}>
      <div className="button-row" style={{ justifyContent: "space-between", marginTop: 0 }}>
        <span className={hidden ? "chip green" : "chip"}><Radar size={14} /> {company.classification}</span>
        <ArrowUpRight size={17} />
      </div>
      <div>
        <h3>{company.name}</h3>
        <p>{company.ticker} · {company.sector || "Public company"} · {company.country || "Global"}</p>
      </div>
      <div className="metric-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <div><span className="chip">ESG</span><strong>{company.currentScore}</strong></div>
        <div><span className="chip">Momentum</span><strong>{company.momentumScore >= 0 ? "+" : ""}{company.momentumScore}</strong></div>
        <div><span className="chip">Digital</span><strong>{Math.round((company.signals.hiring + company.signals.patents + company.signals.trendConsistency) / 3)}</strong></div>
      </div>
      <span className="secondary-btn fit"><Gauge size={15} /> Investigate</span>
    </Link>
  );
}
