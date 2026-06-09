"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { ESGAnalysis } from "@/lib/esg/types";
import { CompanyCard } from "@/components/cards/CompanyCard";

const key = "esg_pulse_watchlist";

export function WatchlistClient() {
  const [items, setItems] = useState<ESGAnalysis[]>([]);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(key) || "[]"));
  }, []);

  function remove(ticker: string) {
    const next = items.filter((item) => item.ticker !== ticker);
    setItems(next);
    localStorage.setItem(key, JSON.stringify(next));
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <strong>Search any company to begin tracking</strong>
        <p>Your saved mission verdicts will persist here across browser refreshes.</p>
        <div className="button-row">
          <Link className="primary-btn fit" href="/investigate">Start Investigation</Link>
        </div>
      </div>
    );
  }

  return (
    <section className="watch-grid">
      {items.map((company) => (
        <div key={company.ticker} className="mission-shell">
          <CompanyCard company={company} />
          <button className="secondary-btn fit" onClick={() => remove(company.ticker)}><Trash2 size={16} /> Remove</button>
        </div>
      ))}
    </section>
  );
}
