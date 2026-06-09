import { Search, Sparkles } from "lucide-react";

export function CompanySearch({ compact = false, defaultValue = "" }: { compact?: boolean; defaultValue?: string }) {
  return (
    <form className={`search-box ${compact ? "compact-search" : ""}`} action="/dashboard" method="get">
      <Search size={19} aria-hidden />
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Search ticker or company, e.g. DBS, TSLA, Microsoft"
        aria-label="Search company"
      />
      <button className="primary-btn" type="submit">
        <Sparkles size={17} />
        Analyze
      </button>
    </form>
  );
}
