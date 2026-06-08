import { AppHeader } from "@/components/layout/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("name,email").eq("id", user.id).single();

  return (
    <div className="app-shell">
      <AppHeader name={profile?.name ?? user.user_metadata?.name} email={profile?.email ?? user.email} />
      {children}
    </div>
  );
}
