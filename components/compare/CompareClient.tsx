"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { GitCompare, Search } from "lucide-react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ESGAnalysis } from "@/lib/esg/types";

function cellClass(value: number) {
  if (value > 65) return "cell-green";
  if (value >= 45) return "cell-gold";
  return "cell-red";
}

async function fetchAnalysis(query: string) {
  const response = await fetch(`/api/company/analyze?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.analysis as ESGAnalysis;
}

export function CompareClient({ initial = "DBS,TSLA" }: { initial?: string }) {
  const [query, setQuery] = useState(initial);
  const [companies, setCompanies] = useState<ESGAnalysis[]>([]);
  const [loading, setLoading] = useState(false);

  async function run(nextQuery = query) {
    const terms = nextQuery.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 3);
    if (!terms.length) return;
    setLoading(true);
    try {
      setCompanies(await Promise.all(terms.map(fetchAnalysis)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { run(initial); }, [initial]);

  function submit(event: FormEvent) {
    event.preventDefault();
    run();
  }

  const radarData = useMemo(() => {
    const metrics = [
      ["Environmental", "news"],
      ["Social", "hiring"],
      ["Governance", "governance"],
      ["Digital ESG", "patents"],
      ["Trend", "trendConsistency"]
    ] as const;
    return metrics.map(([metric, key]) => {
      const row: Record<string, string | number> = { metric };
      companies.forEach((company) => { row[company.ticker] = company.signals[key]; });
      return row;
    });
  }, [companies]);

  return (
    <div className="mission-shell">
      <form className="search-box" onSubmit={submit}>
        <Search size={19} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Compare up to 3 companies, e.g. DBS, TSLA, MSFT" />
        <button className="primary-btn" type="submit"><GitCompare size={17} /> Compare</button>
      </form>

      {loading ? <div className="skeleton" /> : null}

      {companies.length ? (
        <>
          <section className="panel">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {companies.map((company) => <th key={company.ticker}>{company.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Environmental", (c: ESGAnalysis) => c.signals.news],
                  ["Social", (c: ESGAnalysis) => c.signals.hiring],
                  ["Governance", (c: ESGAnalysis) => c.signals.governance],
                  ["Digital ESG", (c: ESGAnalysis) => Math.round((c.signals.hiring + c.signals.patents + c.signals.trendConsistency) / 3)],
                  ["Overall Momentum", (c: ESGAnalysis) => c.momentumScore],
                  ["Risk Status", (c: ESGAnalysis) => c.risks.length ? "Watch" : "Clear"],
                  ["12mo Forecast", (c: ESGAnalysis) => c.forecastScore],
                  ["Quadrant", (c: ESGAnalysis) => c.classification]
                ].map(([label, getter]) => (
                  <tr key={label as string}>
                    <td><strong>{label as string}</strong></td>
                    {companies.map((company) => {
                      const value = (getter as (c: ESGAnalysis) => number | string)(company);
                      return <td key={company.ticker} className={typeof value === "number" ? cellClass(value) : ""}>{value}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="panel">
            <h2>Signal Spider</h2>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Tooltip />
                  {companies.map((company, index) => (
                    <Radar key={company.ticker} dataKey={company.ticker} stroke={["#16A34A", "#0D9488", "#D97706"][index]} fill={["#16A34A", "#0D9488", "#D97706"][index]} fillOpacity={0.14} animationDuration={1500} />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p>{companies[0].name} has the strongest current signal among this comparison when its forecast and momentum exceed the peer set; use the quadrant row to separate hidden improvers from already-recognized leaders.</p>
          </section>
        </>
      ) : null}
    </div>
  );
}
