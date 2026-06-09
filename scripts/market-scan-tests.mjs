const baseUrl = process.env.MARKET_SCAN_BASE_URL || "http://localhost:3000";

async function json(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${path} returned ${response.status}: ${text}`);
  }
  return response.json();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const unknown = await json("/api/market/scan/custom", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ companies: ["UNKNOWN_COMPANY_DOES_NOT_EXIST_12345"], maxCompanies: 1, companyTimeoutMs: 5000 })
});
assert(unknown.data.errors.length > 0 || unknown.data.summary.companiesScanned === 0, "unknown company must fail gracefully without fake results");
assert(unknown.data.results.every((result) => result.verdict === "INSUFFICIENT DATA"), "unknown company must not receive investment signal");
console.log("PASS custom scan unknown company");

const sectorUniverse = await json("/api/market/universe/sector?sector=&maxCompanies=3");
assert(Array.isArray(sectorUniverse.data.errors), "sector universe with missing sector must return structured errors");
console.log("PASS sector universe unavailable provider handling");

const now = new Date().toISOString();
const marketOnly = await json("/api/intelligence/analyse", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    company: { id: "market_only", name: "Market Only Co", ticker: "MKT" },
    evidence: [
      {
        id: "market_only_1",
        source: "finance",
        provider: "Yahoo Finance",
        category: "market",
        title: "Market trend evidence for MKT",
        description: "Yahoo Finance market performance. This is market intelligence, not ESG scoring.",
        capturedAt: now,
        publishedAt: now,
        reliability: 0.82,
        confidence: "medium",
        matchedKeywords: [],
        tags: ["market", "not-esg"],
        rawMetadata: {}
      }
    ]
  })
});
assert(marketOnly.data.status === "insufficient_evidence", "market trend alone must be insufficient evidence");
assert(marketOnly.data.scores === null, "market trend alone must not produce ESG score");
assert(marketOnly.data.verdict === "INSUFFICIENT DATA", "market trend alone must not produce buy/hold/avoid");
console.log("PASS market trend only no signal");

const sourceText = await (await import("fs/promises")).readFile("src/services/market/scan-service.ts", "utf8");
assert(!/const\s+\w*(companies|Companies|List|Universe)\s*=\s*\[[^\]]*ticker/i.test(sourceText), "scan service must not contain hardcoded company universe");
console.log("PASS no hardcoded company universe pattern");
