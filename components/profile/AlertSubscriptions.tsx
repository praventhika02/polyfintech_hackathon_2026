"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { AlertSubscription } from "@/lib/types";

const alerts = [
  { id: "momentum", label: "ESG Momentum Changes" },
  { id: "hidden_winners", label: "Hidden Winner Alerts" },
  { id: "risk", label: "ESG Risk Alerts" }
] as const;

export function AlertSubscriptions({ initialItems, userId }: { initialItems: AlertSubscription[]; userId: string }) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function toggle(alertType: AlertSubscription["alert_type"], checked: boolean) {
    setError(null);
    if (checked) {
      const { data, error: insertError } = await supabase
        .from("alert_subscriptions")
        .upsert({ user_id: userId, alert_type: alertType }, { onConflict: "user_id,alert_type" })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setItems((current) => [data as AlertSubscription, ...current.filter((item) => item.alert_type !== alertType)]);
      return;
    }

    const { error: deleteError } = await supabase
      .from("alert_subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("alert_type", alertType);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setItems((current) => current.filter((item) => item.alert_type !== alertType));
  }

  return (
    <div className="profile-panel">
      <h2>ESG alert subscriptions</h2>
      {error ? <div className="error">{error}</div> : null}
      <div className="list">
        {alerts.map((alert) => (
          <label className="list-row" key={alert.id}>
            <strong>{alert.label}</strong>
            <input
              type="checkbox"
              checked={items.some((item) => item.alert_type === alert.id)}
              onChange={(event) => toggle(alert.id, event.target.checked)}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
