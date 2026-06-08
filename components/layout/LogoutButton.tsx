"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth/logout";

export function LogoutButton() {
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={onLogout}>
      <LogOut size={15} /> Logout
    </button>
  );
}
