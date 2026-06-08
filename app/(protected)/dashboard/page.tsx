import Link from "next/link";
import { Activity, ArrowUpRight, ShieldAlert, Sparkles } from "lucide-react";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardPage({ searchParams }: { searchParams: { welcome?: string } }) {
  const user = await requireUser();
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
  const name = profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "Investor";

  return (
    <main className="page">
      <WelcomeBanner name={name} show={searchParams.welcome === "1"} />
      <div className="page-header">
        <div>
          <h1>ESG Momentum Command Center</h1>
          <p>Search companies, monitor predictive ESG movement, and move quickly from signal to investor action.</p>
        </div>
        <Link className="secondary-btn" style={{ width: "auto", padding: "0 16px" }} href="/profile">Profile</Link>
      </div>
      <section className="grid">
        <div className="card"><span>Current ESG Signal</span><strong>74</strong></div>
        <div className="card"><span>12-Month Forecast</span><strong>82</strong></div>
        <div className="card"><span>Momentum Score</span><strong>+18</strong></div>
        <div className="card"><span>Confidence</span><strong>87%</strong></div>
      </section>
      <section className="dashboard-layout" style={{ marginTop: 18 }}>
        <div className="profile-panel">
          <h2>Live intelligence workspace</h2>
          <div className="list">
            {[
              ["Hidden Winners Radar", "Find low-rated companies with improving ESG momentum.", "/hidden-winners", Sparkles],
              ["Early Warning", "Track negative governance, emissions, and labour signals.", "/early-warning", ShieldAlert],
              ["Company Intelligence", "Open a company digital twin by ticker.", "/company/TSLA", Activity],
              ["AI Copilot", "Ask evidence-grounded questions about stored ESG analysis.", "/copilot", ArrowUpRight]
            ].map(([title, body, href, Icon]) => (
              <Link className="list-row" href={href as string} key={title as string}>
                <div>
                  <strong>{title as string}</strong>
                  <span style={{ display: "block", color: "var(--muted)" }}>{body as string}</span>
                </div>
                <Icon size={20} />
              </Link>
            ))}
          </div>
        </div>
        <div className="profile-panel">
          <h2>Investor signal</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>Watch. Positive alternative-data coverage is improving, but confidence should be validated with recent company-level analysis.</p>
          <Link className="primary-btn" href="/company/DBS">Analyze DBS</Link>
        </div>
      </section>
    </main>
  );
}
