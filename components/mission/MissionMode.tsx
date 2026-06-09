"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, BadgeCheck, BriefcaseBusiness, Check, Clock3, Cpu, DatabaseZap, Gauge, Radar, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ESGAnalysis, MomentumClass } from "@/lib/esg/types";
import { CountUpNumber } from "@/components/ui/CountUpNumber";
import { MomentumMatrix } from "@/components/dashboard/MomentumMatrix";
import { EvidenceList } from "@/components/dashboard/EvidenceList";

const missions = ["Profile", "Scan", "Momentum", "Risk", "Digital", "Verdict"];

function riskStatus(analysis: ESGAnalysis) {
  if (analysis.risks.length >= 2 || analysis.momentumScore < -8) return "Alert";
  if (analysis.risks.length || analysis.confidenceScore < 58) return "Watch";
  return "Clear";
}

function verdict(analysis: ESGAnalysis) {
  const risk = riskStatus(analysis);
  if ((analysis.classification === "Hidden Winner" || analysis.classification === "Future Leader") && risk === "Clear") return "BUY SIGNAL";
  if ((analysis.classification === "Hidden Winner" || analysis.classification === "Future Leader") && risk === "Watch") return "WATCH";
  if (analysis.classification === "Overrated Leader" && risk === "Clear") return "HOLD";
  return "AVOID";
}

function quadrantPosition(quadrant: MomentumClass) {
  if (quadrant === "Hidden Winner") return { left: "24%", top: "72%" };
  if (quadrant === "Future Leader") return { left: "74%", top: "72%" };
  if (quadrant === "Value Trap") return { left: "24%", top: "28%" };
  return { left: "74%", top: "28%" };
}

function scenarioData(analysis: ESGAnalysis, mode: string) {
  const current = analysis.currentScore;
  const base = Math.round(current + analysis.momentumScore * 0.72);
  const accelerate = Math.min(100, base + 9 + Math.round(analysis.signals.hiring / 18));
  const cuts = Math.max(0, base - 12 - analysis.risks.length * 4);
  const final = mode === "accelerate" ? accelerate : mode === "cuts" ? cuts : base;
  return ["Current", "3mo", "6mo", "9mo", "12mo"].map((label, index) => {
    const progress = index / 4;
    return {
      label,
      Current: Math.round(current + (base - current) * progress),
      Accelerate: Math.round(current + (accelerate - current) * progress),
      Cuts: Math.round(current + (cuts - current) * progress),
      Active: Math.round(current + (final - current) * progress)
    };
  });
}

function SaveButton({ analysis }: { analysis: ESGAnalysis }) {
  function save() {
    const key = "esg_pulse_watchlist";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const filtered = existing.filter((item: ESGAnalysis) => item.ticker !== analysis.ticker);
    localStorage.setItem(key, JSON.stringify([{ ...analysis, updatedAt: new Date().toISOString() }, ...filtered].slice(0, 20)));
  }
  return <button className="primary-btn fit" onClick={save}><BadgeCheck size={17} /> Add to Watchlist</button>;
}

function HiddenWinnerCelebration() {
  return (
    <motion.div className="panel hidden-banner" initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <div className="confetti">
        {Array.from({ length: 38 }).map((_, index) => (
          <i key={index} style={{ left: `${(index * 23) % 100}%`, animationDelay: `${(index % 9) * 0.08}s`, background: index % 3 === 0 ? "#16A34A" : index % 3 === 1 ? "#0D9488" : "#D97706" }} />
        ))}
      </div>
      <span className="eyebrow">Hidden Winner Detected</span>
      <h2>ESG improvement detected before annual scores.</h2>
      <p>This is what momentum investing looks like: lower current score, positive trajectory, and no severe red flag in the current evidence window.</p>
    </motion.div>
  );
}

export function MissionMode({ analysis }: { analysis: ESGAnalysis }) {
  const [scenario, setScenario] = useState("current");
  const risk = riskStatus(analysis);
  const finalVerdict = verdict(analysis);
  const digitalScore = Math.round((analysis.signals.hiring * 0.36 + analysis.signals.patents * 0.36 + analysis.signals.trendConsistency * 0.28));
  const projected = scenarioData(analysis, scenario);
  const hiddenWinner = analysis.classification === "Hidden Winner" && risk === "Clear";
  const dot = quadrantPosition(analysis.classification);

  const verdictReasons = useMemo(() => [
    `${analysis.classification} quadrant from current score ${analysis.currentScore} and momentum ${analysis.momentumScore >= 0 ? "+" : ""}${analysis.momentumScore}.`,
    `Risk status is ${risk.toLowerCase()} across ${analysis.news.length} news evidence item${analysis.news.length === 1 ? "" : "s"}.`,
    `Digital ESG score is ${digitalScore}, driven by hiring, patent, and trend-consistency signals.`
  ], [analysis, risk, digitalScore]);

  return (
    <div className="mission-shell">
      <nav className="mission-progress" aria-label="Mission progress">
        {missions.map((mission, index) => (
          <div className="mission-step done" key={mission}>
            <span className="mission-dot"><Check size={15} /></span>
            <span>Mission {index + 1}</span>
            <strong>{mission}</strong>
          </div>
        ))}
      </nav>

      <motion.section className="panel mission-panel" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="company-strip">
          <div>
            <span className="eyebrow">Mission 1 · Company Profile</span>
            <h1>{analysis.name}</h1>
            <p>{analysis.ticker} · {analysis.exchange || "Global"} · {analysis.sector || "Public company"} · {analysis.country || "Global"}</p>
          </div>
          <span className="chip dark"><Radar size={15} /> Intelligence scan complete</span>
        </div>
      </motion.section>

      <motion.section className="panel mission-panel" initial={{ y: 24, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
        <span className="eyebrow">Mission 2 · Evidence Collection</span>
        <h2>Scanning live investor evidence.</h2>
        <div className="scan-list">
          {[
            ["News Intelligence", `${analysis.news.length} articles`, analysis.coverage.news ? 100 : 46],
            ["Job Market Intelligence", `${analysis.jobSignal.count} postings`, analysis.coverage.jobs ? 100 : 45],
            ["Patent Intelligence", `${analysis.patentSignal.count} matches`, analysis.coverage.patents ? 100 : 45],
            ["Market Trend Proxy", analysis.market ? `${analysis.market.change3m}% 3mo` : "Unavailable", analysis.coverage.market ? 100 : 45],
            ["Regulatory and Local-Language Signals", "Skipped if unavailable", 62]
          ].map(([name, status, width], index) => (
            <motion.div className="scan-row" key={name as string} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.16 }}>
              <span className="live">[LIVE]</span>
              <strong>{name}</strong>
              <div className="bar-track"><motion.i initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: index * 0.12 }} /></div>
              <span>{status}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <section className="mission-grid">
        <motion.div className="panel mission-panel" initial={{ y: 24, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
          <span className="eyebrow">Mission 3 · Momentum Tracker</span>
          <h2>Where the company is moving now.</h2>
          <div className="signal-bars">
            {[
              ["Environmental news", analysis.signals.news],
              ["Social and hiring", analysis.signals.hiring],
              ["Governance", analysis.signals.governance]
            ].map(([label, value]) => (
              <div className="bar-row" key={label as string}>
                <span>{label}</span>
                <div className="bar-track"><motion.i initial={{ width: 0 }} whileInView={{ width: `${value}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeOut" }} /></div>
                <strong><CountUpNumber value={value as number} /></strong>
              </div>
            ))}
          </div>
          <div className="matrix-wrap">
            <MomentumMatrix active={analysis.classification} />
            <motion.span className="matrix-dot" initial={{ left: dot.left, top: "0%" }} whileInView={{ left: dot.left, top: dot.top }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 120, damping: 14 }} />
          </div>
        </motion.div>
        <motion.div className="panel mission-panel" initial={{ x: 80, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
          <span className="eyebrow">Evidence Cards</span>
          <h2>What drove this signal?</h2>
          <EvidenceList analysis={analysis} />
        </motion.div>
      </section>

      <section className="mission-grid">
        <motion.div className="panel mission-panel" initial={{ x: 80, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
          <span className="eyebrow">Mission 4 · Red Flag Radar</span>
          <h2>{risk === "Clear" ? "No significant ESG risk signal detected." : `${risk} risk signal detected.`}</h2>
          <p>Monitoring news evidence, market proxy, hiring, patents, and optional regulatory/local-language sources.</p>
          {analysis.risks.length ? (
            <ul className="risk-list">
              {analysis.risks.map((item, index) => <motion.li key={item} initial={{ x: 80, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}><AlertTriangle size={16} /> {item}</motion.li>)}
            </ul>
          ) : <div className="empty-state"><strong><ShieldCheck size={16} /> Clear current window</strong><p>No severe controversy appeared in fetched public evidence.</p></div>}
        </motion.div>
        <motion.div className="panel mission-panel" initial={{ y: 24, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
          <span className="eyebrow">Mission 5 · Digital ESG Score</span>
          <h2><CountUpNumber value={digitalScore} /> / 100</h2>
          <div className="signal-bars">
            <div className="bar-row"><span>Hiring velocity</span><div className="bar-track"><i style={{ width: `${analysis.signals.hiring}%` }} /></div><strong>{analysis.signals.hiring}</strong></div>
            <div className="bar-row"><span>Innovation index</span><div className="bar-track"><i style={{ width: `${analysis.signals.patents}%` }} /></div><strong>{analysis.signals.patents}</strong></div>
            <div className="bar-row"><span>Digital risk rating</span><div className="bar-track"><i style={{ width: `${analysis.signals.trendConsistency}%` }} /></div><strong>{analysis.signals.trendConsistency}</strong></div>
          </div>
          <p>{digitalScore >= 65 ? "Digital transformation is acting as an ESG asset." : digitalScore >= 45 ? "Digital ESG is investable but needs monitoring." : "Digital ESG is currently a liability in the scoring mix."}</p>
        </motion.div>
      </section>

      <motion.section className="panel mission-panel" initial={{ y: 24, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
        <span className="eyebrow">Mission 6 · ESG Time Machine</span>
        <h2><Clock3 size={24} /> 12-month scenario forecast</h2>
        <div className="scenario-grid">
          {[["current", "Current trajectory", projected.at(-1)?.Current], ["accelerate", "Accelerate ESG", projected.at(-1)?.Accelerate], ["cuts", "Governance cuts", projected.at(-1)?.Cuts]].map(([key, label, score]) => (
            <button className={`scenario-card ${scenario === key ? "active" : ""}`} key={key as string} onClick={() => setScenario(key as string)}>
              <strong>{label}</strong>
              <p>Projected: {score} ({Number(score) - analysis.currentScore >= 0 ? "+" : ""}{Number(score) - analysis.currentScore})</p>
            </button>
          ))}
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={projected} margin={{ left: 0, right: 12, top: 18, bottom: 0 }}>
              <CartesianGrid stroke="#E2E8F0" vertical={false} />
              <ReferenceArea y1={40} y2={60} fill="#FEF3C7" fillOpacity={0.28} label="Hidden Winner zone" />
              <ReferenceArea y1={60} y2={100} fill="#DCFCE7" fillOpacity={0.22} label="Future Leader zone" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Current" stroke="#94A3B8" strokeWidth={2} dot={false} animationDuration={1500} />
              <Line type="monotone" dataKey="Accelerate" stroke="#CBD5E1" strokeWidth={2} dot={false} animationDuration={1500} />
              <Line type="monotone" dataKey="Cuts" stroke="#CBD5E1" strokeWidth={2} dot={false} animationDuration={1500} />
              <Line type="monotone" dataKey="Active" stroke="#16A34A" strokeWidth={4} dot animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p>Predicted quadrant in 12 months: <strong>{analysis.forecastScore >= 68 ? "Future Leader" : analysis.momentumScore >= 0 ? "Hidden Winner" : "Value Trap"}</strong>. Digital ESG modifier: {digitalScore >= 65 ? "positive" : digitalScore >= 45 ? "neutral" : "negative"}.</p>
      </motion.section>

      {hiddenWinner ? <HiddenWinnerCelebration /> : null}

      <motion.section className="panel mission-panel verdict" initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 130, damping: 14 }}>
        <span className="eyebrow">Investor Verdict</span>
        <div className={`verdict-chip ${finalVerdict.toLowerCase().split(" ")[0]}`}>{finalVerdict}</div>
        <ul className="insight-list">
          {verdictReasons.map((reason) => <li key={reason}>{reason}</li>)}
        </ul>
        <div className="button-row">
          <SaveButton analysis={analysis} />
          <Link className="secondary-btn fit" href={`/compare?q=${encodeURIComponent(analysis.ticker)}`}><DatabaseZap size={17} /> Compare with another company</Link>
        </div>
      </motion.section>
    </div>
  );
}
