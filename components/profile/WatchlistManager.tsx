"use client";

import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import type { WatchlistItem } from "@/lib/types";

const suggestions = [
  { ticker: "TSLA", company_name: "Tesla" },
  { ticker: "D05.SI", company_name: "DBS" },
  { ticker: "O39.SI", company_name: "OCBC" }
];

export function WatchlistManager({ initialItems, userId }: { initialItems: WatchlistItem[]; userId: string }) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function saveCompany(company: { ticker: string; company_name: string }) {
    setError(null);
    const { data, error: insertError } = await supabase
      .from("watchlists")
      .upsert({ user_id: userId, ...company }, { onConflict: "user_id,ticker" })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setItems((current) => [data as WatchlistItem, ...current.filter((item) => item.ticker !== company.ticker)]);
  }

  async function removeItem(id: string) {
    setError(null);
    const { error: deleteError } = await supabase.from("watchlists").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="profile-panel" id="watchlist">
      <h2>Saved watchlist</h2>
      {error ? <div className="error">{error}</div> : null}
      <div className="form-row" style={{ marginBottom: 14, flexWrap: "wrap", justifyContent: "flex-start" }}>
        {suggestions.map((company) => (
          <button className="secondary-btn" style={{ width: "auto", padding: "0 13px" }} key={company.ticker} onClick={() => saveCompany(company)} type="button">
            <Star size={16} /> Save {company.company_name}
          </button>
        ))}
      </div>
      <div className="list">
        {items.length ? items.map((item) => (
          <div className="list-row" key={item.id}>
            <div>
              <strong>{item.company_name}</strong>
              <span style={{ display: "block", color: "var(--muted)" }}>{item.ticker}</span>
            </div>
            <button className="icon-btn" aria-label={`Remove ${item.company_name}`} onClick={() => removeItem(item.id)} type="button">
              <Trash2 size={17} />
            </button>
          </div>
        )) : <p style={{ color: "var(--muted)" }}>No saved companies yet.</p>}
      </div>
    </div>
  );
}
