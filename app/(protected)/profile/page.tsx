import { AlertSubscriptions } from "@/components/profile/AlertSubscriptions";
import { WatchlistManager } from "@/components/profile/WatchlistManager";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import type { AlertSubscription, WatchlistItem } from "@/lib/types";

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = createClient();
  const [{ data: profile }, { data: watchlist }, { data: alerts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("watchlists").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("alert_subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
  ]);

  const name = profile?.name || user.user_metadata?.name || "Investor";
  const email = profile?.email || user.email || "";
  const createdAt = new Intl.DateTimeFormat("en-SG", { dateStyle: "medium" }).format(new Date(profile?.created_at || user.created_at));

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p>Manage account identity, saved companies, alert subscriptions, and ESG Alpha workspace settings.</p>
        </div>
      </div>
      <section className="profile-layout">
        <div className="profile-panel">
          <h2>Account</h2>
          <div className="list">
            <div className="list-row"><span>Name</span><strong>{name}</strong></div>
            <div className="list-row"><span>Email</span><strong>{email}</strong></div>
            <div className="list-row"><span>Account created</span><strong>{createdAt}</strong></div>
            <div className="list-row"><span>Companies analyzed</span><strong>{watchlist?.length || 0}</strong></div>
          </div>
        </div>
        <AlertSubscriptions initialItems={(alerts || []) as AlertSubscription[]} userId={user.id} />
        <WatchlistManager initialItems={(watchlist || []) as WatchlistItem[]} userId={user.id} />
        <div className="profile-panel" id="settings">
          <h2>User settings</h2>
          <div className="list">
            <label className="list-row"><strong>Investor-grade motion</strong><input type="checkbox" defaultChecked /></label>
            <label className="list-row"><strong>Weekly ESG digest</strong><input type="checkbox" defaultChecked /></label>
            <label className="list-row"><strong>Private analysis history</strong><input type="checkbox" defaultChecked /></label>
          </div>
        </div>
      </section>
    </main>
  );
}
