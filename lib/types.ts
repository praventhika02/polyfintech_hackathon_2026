export type Profile = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
};

export type WatchlistItem = {
  id: string;
  user_id: string;
  ticker: string;
  company_name: string;
  created_at: string;
};

export type AlertSubscription = {
  id: string;
  user_id: string;
  alert_type: "momentum" | "hidden_winners" | "risk";
  created_at: string;
};
