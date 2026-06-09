import Link from "next/link";
import { Activity, Radar } from "lucide-react";

const links = [
  ["Investigate", "/investigate"],
  ["Radar", "/radar"],
  ["Compare", "/compare"],
  ["Watchlist", "/watchlist"],
  ["Methodology", "/methodology"]
];

export function AppHeader() {
  return (
    <header className="top-nav">
      <Link className="brand-lockup compact" href="/">
        <span className="brand-mark"><Radar size={21} /></span>
        <span>
          <strong>ESG Pulse 360</strong>
          <small>Momentum intelligence</small>
        </span>
      </Link>
      <nav className="nav-links" aria-label="Primary">
        {links.map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
      <Link className="nav-action" href="/investigate">
        <Activity size={17} />
        Start scan
      </Link>
    </header>
  );
}
