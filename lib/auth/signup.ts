"use client";

import { createClient } from "@/lib/supabase/browser";

export async function signUpWithPassword(name: string, email: string, password: string) {
  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard?welcome=1`,
      data: { name }
    }
  });
}
