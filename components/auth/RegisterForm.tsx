"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { signUpWithPassword } from "@/lib/auth/signup";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signUpError } = await signUpWithPassword(name, email, password);
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setMessage("Check your inbox to confirm your account, then sign in.");
    router.refresh();
  }

  return (
    <div className="auth-card">
      <h2>Create account</h2>
      <p>Start saving watchlists, alert subscriptions, and private ESG analysis history.</p>
      <form className="form-stack" onSubmit={onSubmit}>
        {message ? <div className="notice">{message}</div> : null}
        {error ? <div className="error">{error}</div> : null}
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </div>
        <button className="primary-btn" disabled={loading} type="submit">
          <UserPlus size={18} /> {loading ? "Creating..." : "Sign Up"}
        </button>
        <p>Already have access? <Link className="text-link" href="/login">Login</Link></p>
      </form>
    </div>
  );
}
