"use client";

import { motion } from "framer-motion";

const particles = [
  ["12%", "18%"], ["22%", "70%"], ["38%", "28%"], ["52%", "78%"], ["68%", "18%"],
  ["82%", "58%"], ["90%", "32%"], ["74%", "82%"], ["44%", "55%"], ["16%", "48%"]
];

export function AuthLayout({ children, mode }: { children: React.ReactNode; mode: "login" | "register" | "forgot" | "reset" }) {
  return (
    <main className="auth-shell">
      <div className="particles" aria-hidden>
        {particles.map(([left, top], index) => (
          <i key={`${left}-${top}`} className="particle" style={{ left, top, animationDelay: `${index * 0.42}s` }} />
        ))}
      </div>
      <section className="auth-hero">
        <motion.div className="brand-lockup" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="brand-mark">EA</div>
          <div>
            <strong>ESG Alpha</strong>
            <span>Digital Twin Intelligence</span>
          </div>
        </motion.div>
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <h1>Don&apos;t Measure ESG. Predict It.</h1>
          <p>
            A forward-looking intelligence layer for investors tracking ESG momentum, hidden improvers,
            and early risk signals before static ratings catch up.
          </p>
        </motion.div>
        <motion.div className="momentum-card" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <svg className="graph" viewBox="0 0 620 180" role="img" aria-label="Animated ESG momentum graph">
            <defs>
              <linearGradient id={`line-${mode}`} x1="0" x2="1">
                <stop offset="0%" stopColor="#13b7a6" />
                <stop offset="100%" stopColor="#c9a44c" />
              </linearGradient>
            </defs>
            <path d="M24 142 C110 120, 130 92, 198 100 S314 132, 382 76 S506 24, 596 44" fill="none" stroke={`url(#line-${mode})`} strokeWidth="5" strokeLinecap="round">
              <animate attributeName="stroke-dasharray" from="0 800" to="800 0" dur="1.8s" fill="freeze" />
            </path>
            {[24, 198, 382, 596].map((cx, index) => (
              <circle key={cx} cx={cx} cy={[142, 100, 76, 44][index]} r="7" fill={index === 3 ? "#c9a44c" : "#13b7a6"} />
            ))}
            <g opacity="0.34" stroke="#ffffff">
              <path d="M24 154 H596" />
              <path d="M24 102 H596" />
              <path d="M24 50 H596" />
            </g>
          </svg>
        </motion.div>
      </section>
      <section className="auth-panel">
        <motion.div initial={{ opacity: 0, scale: 0.97, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.12 }}>
          {children}
        </motion.div>
      </section>
    </main>
  );
}
