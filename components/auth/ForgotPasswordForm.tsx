"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setMessage("Password reset instructions are on their way.");
  }

  return (
    <div className="auth-card">
      <h2>Reset access</h2>
      <p>Enter your email and we will send a secure recovery link for your ESG Alpha account.</p>
      <form className="form-stack" onSubmit={onSubmit}>
        {message ? <div className="notice">{message}</div> : null}
        {error ? <div className="error">{error}</div> : null}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <button className="primary-btn" disabled={loading} type="submit">
          <Mail size={18} /> {loading ? "Sending..." : "Send reset link"}
        </button>
        <p><Link className="text-link" href="/login">Back to login</Link></p>
      </form>
    </div>
  );
}
