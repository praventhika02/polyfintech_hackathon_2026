"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.replace("/dashboard?welcome=1");
    router.refresh();
  }

  return (
    <div className="auth-card">
      <h2>Choose new password</h2>
      <p>Set a strong password to restore access to your investor workspace.</p>
      <form className="form-stack" onSubmit={onSubmit}>
        {error ? <div className="error">{error}</div> : null}
        <div className="field">
          <label htmlFor="password">New password</label>
          <input id="password" type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </div>
        <button className="primary-btn" disabled={loading} type="submit">
          <KeyRound size={18} /> {loading ? "Updating..." : "Update password"}
        </button>
        <p><Link className="text-link" href="/login">Back to login</Link></p>
      </form>
    </div>
  );
}
