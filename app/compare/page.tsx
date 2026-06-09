import { AppHeader } from "@/components/layout/AppHeader";
import { CompareClient } from "@/components/compare/CompareClient";

export default function ComparePage({ searchParams }: { searchParams?: { q?: string } }) {
  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Side-by-Side Comparison</span>
            <h1>Compare ESG momentum across peers.</h1>
            <p>Choose up to three companies. Each column is calculated from the same runtime scoring engine and public evidence connectors.</p>
          </div>
        </div>
        <CompareClient initial={searchParams?.q || "DBS,TSLA,MSFT"} />
      </main>
    </>
  );
}
