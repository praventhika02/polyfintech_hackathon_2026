"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Clock3, DatabaseZap, Gauge, LineChart, Radar, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { CountUpNumber } from "@/components/ui/CountUpNumber";

const reveal = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function LandingPage() {
  return (
    <>
      <AppHeader />
      <main>
        <section className="hero">
          <motion.div className="hero-copy" initial="hidden" animate="visible" transition={{ staggerChildren: 0.2 }}>
            <motion.span className="eyebrow" variants={reveal}>CGS International · ESG & AI Track</motion.span>
            <motion.h1 variants={reveal}>See Tomorrow&apos;s ESG Leaders</motion.h1>
            <motion.p variants={reveal}>Before the market does.</motion.p>
            <motion.p variants={reveal}>Traditional ESG scores are static, slow, and inconsistent. ESG Pulse 360 uses real-time public evidence to track momentum, detect risks, and predict trajectories before annual disclosures catch up.</motion.p>
            <motion.div className="button-row" variants={reveal}>
              <Link className="primary-btn fit" href="/investigate">Start Investigation <ArrowRight size={18} /></Link>
              <Link className="secondary-btn fit" href="/methodology">See How It Works</Link>
            </motion.div>
          </motion.div>
        </section>

        <section className="band">
          <div className="section-heading">
            <span className="eyebrow">Investor Problem</span>
            <h2>Current ESG ratings are useful, but too slow for active decisions.</h2>
          </div>
          <motion.div className="grid-3" initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ staggerChildren: 0.08 }}>
            {[
              [Clock3, "Static", "Updated once a year", "Annual reporting cycles miss the inflection point."],
              [AlertTriangle, "Slow", "12-18 month lag", "Controversies and improvements price in before reports refresh."],
              [DatabaseZap, "Inconsistent", "MSCI vs Sustainalytics correlation: 0.53", "Investors need transparent evidence, not black-box disagreement."]
            ].map(([Icon, title, stat, body]) => (
              <motion.article className="card" variants={reveal} whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(15,23,42,.08)" }} key={title as string}>
                <Icon size={24} />
                <h3>{title as string}</h3>
                <strong>{stat as string}</strong>
                <p>{body as string}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className="band">
          <div className="section-heading">
            <span className="eyebrow">Four Modules</span>
            <h2>One investigation journey, four investor questions.</h2>
          </div>
          <div className="grid-4">
            {[
              [LineChart, "Momentum Tracker", "Is ESG improving right now?"],
              [Radar, "Red Flag Radar", "Is this company quietly becoming a risk?"],
              [Gauge, "Digital ESG Score", "Is digital transformation an ESG asset or liability?"],
              [ShieldCheck, "Time Machine", "Where could ESG be in 12 months?"]
            ].map(([Icon, title, body], index) => (
              <motion.article className="card" initial={{ y: 22, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} key={title as string}>
                <span className="chip green">{index + 1}</span>
                <Icon size={24} />
                <h3>{title as string}</h3>
                <p>{body as string}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="band">
          <div className="grid-3">
            <article className="card"><span className="stat-number"><CountUpNumber value={61} suffix=".5%" /></span><p>CGS thesis: ESG improvers can outperform over five years.</p></article>
            <article className="card"><span className="stat-number">$<CountUpNumber value={35} />T+</span><p>Global sustainable investment assets need better forward signals.</p></article>
            <article className="card"><span className="stat-number"><CountUpNumber value={52} /></span><p>Weeks a year when live evidence changes but annual ESG ratings may not.</p></article>
          </div>
        </section>

        <section className="band" style={{ background: "#0F172A", color: "white" }}>
          <div className="section-heading">
            <h2>Ready to find tomorrow&apos;s ESG leaders?</h2>
            <p style={{ color: "#94A3B8" }}>Start with DBS, Tesla, Microsoft, Shell, or any public company by name or ticker.</p>
            <div className="button-row">
              <Link className="primary-btn fit" href="/investigate">Start Your First Investigation <ArrowRight size={18} /></Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
