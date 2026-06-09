import { redirect } from "next/navigation";

export default function DashboardCompatPage({ searchParams }: { searchParams?: { q?: string } }) {
  const query = searchParams?.q ? `?q=${encodeURIComponent(searchParams.q)}` : "";
  redirect(`/investigate${query}`);
}
