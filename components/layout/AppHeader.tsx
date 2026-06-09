import Link from "next/link";
import { Activity, Radar } from "lucide-react";

const links = [
  ["Dashboard", "/dashboard"],
  ["Hidden Winners", "/hidden-winners"],
  ["Early Warning", "/early-warning"],
  ["Copilot", "/copilot"],
  ["Methodology", "/methodology"]
];

export function AppHeader() {
  return (
    <header className="top-nav">
      <Link className="brand-lockup compact" href="/">
        <span className="brand-mark"><Radar size={21} /></span>
        <span>
          <strong>ESG Alpha</strong>
          <small>Digital Twin</small>
        </span>
      </Link>
      <nav className="nav-links" aria-label="Primary">
        {links.map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
      <Link className="nav-action" href="/dashboard">
        <Activity size={17} />
        Analyze
      </Link>
    </header>
  );
}
