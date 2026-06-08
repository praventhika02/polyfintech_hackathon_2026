"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Github, LogIn } from "lucide-react";
import { loginWithOAuth, loginWithPassword } from "@/lib/auth/login";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(params.get("error") === "missing-supabase-env" ? "Add Supabase environment variables to enable authentication." : null);
  const [loading, setLoading] = useState(false);
  const next = params.get("next") || "/dashboard?welcome=1";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { error: loginError } = await loginWithPassword(email, password);
    setLoading(false);
    if (loginError) {
      setError(loginError.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="auth-card">
      <h2>Welcome back</h2>
      <p>Sign in to your ESG Alpha workspace and resume monitoring live momentum signals.</p>
      <form className="form-stack" onSubmit={onSubmit}>
        {error ? <div className="error">{error}</div> : null}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </div>
        <div className="form-row">
          <label className="check-row">
            <input type="checkbox" defaultChecked /> Remember me
          </label>
          <Link className="text-link" href="/forgot-password">Forgot password?</Link>
        </div>
        <button className="primary-btn" disabled={loading} type="submit">
          <LogIn size={18} /> {loading ? "Signing in..." : "Login"}
        </button>
        <div className="splitter">or</div>
        <button className="secondary-btn" type="button" onClick={() => loginWithOAuth("google")}>Continue with Google</button>
        <button className="secondary-btn" type="button" onClick={() => loginWithOAuth("github")}><Github size={18} /> Continue with GitHub</button>
        <p>New to ESG Alpha? <Link className="text-link" href="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
