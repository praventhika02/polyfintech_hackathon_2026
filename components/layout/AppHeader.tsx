import Link from "next/link";
import { BarChart3, Bell, Search, Settings, Star, User } from "lucide-react";
import { LogoutButton } from "@/components/layout/LogoutButton";

export function AppHeader({ name, email }: { name?: string | null; email?: string | null }) {
  const initial = (name || email || "A").slice(0, 1).toUpperCase();

  return (
    <header className="top-nav">
      <Link className="brand-lockup" href="/dashboard" style={{ marginBottom: 0, color: "var(--ink)" }}>
        <div className="brand-mark">EA</div>
        <div>
          <strong>ESG Alpha</strong>
          <span style={{ color: "var(--muted)" }}>Investor workspace</span>
        </div>
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/hidden-winners">Hidden Winners</Link>
        <Link href="/early-warning">Early Warning</Link>
        <Link href="/copilot">Copilot</Link>
      </nav>
      <div className="avatar-menu">
        <button className="avatar-button" aria-label="Open profile menu">
          <span className="avatar">{initial}</span>
          <span>{name || email || "Investor"}</span>
        </button>
        <div className="dropdown">
          <Link href="/profile"><User size={15} /> Profile</Link>
          <Link href="/profile#watchlist"><Star size={15} /> Watchlist</Link>
          <Link href="/profile#settings"><Settings size={15} /> Settings</Link>
          <Link href="/dashboard"><BarChart3 size={15} /> Dashboard</Link>
          <Link href="/early-warning"><Bell size={15} /> Alerts</Link>
          <Link href="/dashboard"><Search size={15} /> Search</Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
