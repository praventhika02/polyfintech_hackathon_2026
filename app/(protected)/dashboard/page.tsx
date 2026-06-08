import Link from "next/link";
import { Activity, ArrowUpRight, ShieldAlert, Sparkles } from "lucide-react";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { analyzeUniverse } from "@/lib/esg/data";
import { CompanySearch } from "@/components/dashboard/CompanySearch";
import { ForecastChart } from "@/components/charts/ForecastChart";

export default async function DashboardPage({ searchParams }: { searchParams: { welcome?: string } }) {
  const user = await requireUser();
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
  const name = profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "Investor";
  const universe = await analyzeUniverse(8);
  const leader = universe[0];
  const hiddenCount = universe.filter((company) => company.classification === "Hidden Winner").length;
  const riskCount = universe.filter((company) => company.risks.length > 0).length;

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
      <CompanySearch />
      <section className="grid">
        <div className="card"><span>Top Current Signal</span><strong>{leader?.currentScore ?? "--"}</strong></div>
        <div className="card"><span>Top Forecast</span><strong>{leader?.forecastScore ?? "--"}</strong></div>
        <div className="card"><span>Hidden Winners</span><strong>{hiddenCount}</strong></div>
        <div className="card"><span>Risk Flags</span><strong>{riskCount}</strong></div>
      </section>
      <section className="dashboard-layout" style={{ marginTop: 18 }}>
        <div className="profile-panel">
          <h2>ESG Momentum Radar</h2>
          <div className="list">
            {universe.map((company) => (
              <Link className="list-row" href={`/company/${encodeURIComponent(company.ticker)}`} key={company.ticker}>
                <div>
                  <strong>{company.name}</strong>
                  <span style={{ display: "block", color: "var(--muted)" }}>{company.classification} · {company.sector} · {company.country}</span>
                </div>
                <strong>{company.momentumScore > 0 ? "+" : ""}{company.momentumScore}</strong>
              </Link>
            ))}
          </div>
        </div>
        <div className="profile-panel">
          <h2>{leader ? `${leader.name} forecast` : "Forecast"}</h2>
          {leader ? <ForecastChart data={leader.forecast} /> : null}
          <div className="quick-links">
            <Link href="/hidden-winners"><Sparkles size={17} /> Hidden Winners</Link>
            <Link href="/early-warning"><ShieldAlert size={17} /> Early Warning</Link>
            <Link href="/company/TSLA"><Activity size={17} /> Company Twin</Link>
            <Link href="/copilot"><ArrowUpRight size={17} /> Copilot</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
