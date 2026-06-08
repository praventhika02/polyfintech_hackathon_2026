"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function CompanySearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (value) router.push(`/company/${encodeURIComponent(value)}`);
  }

  return (
    <form className="search-box" onSubmit={onSubmit}>
      <Search size={19} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search ticker or company, e.g. DBS, TSLA, Microsoft"
        aria-label="Search company"
      />
      <button className="primary-btn" style={{ width: "auto", minWidth: 118 }} type="submit">Analyze</button>
    </form>
  );
}
