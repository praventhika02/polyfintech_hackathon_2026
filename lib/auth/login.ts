"use client";

import { createClient } from "@/lib/supabase/browser";

export async function loginWithPassword(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function loginWithOAuth(provider: "google" | "github") {
  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/dashboard?welcome=1`
    }
  });
}
