import { redirect } from "next/navigation";

export default function CompanyCompatPage({ params }: { params: { ticker: string } }) {
  redirect(`/investigate/${encodeURIComponent(params.ticker)}`);
}
