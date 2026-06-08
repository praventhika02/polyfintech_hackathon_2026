"use client";

import { createClient } from "@/lib/supabase/browser";

export async function logout() {
  const supabase = createClient();
  return supabase.auth.signOut();
}
