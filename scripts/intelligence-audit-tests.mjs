const baseUrl = process.env.INTELLIGENCE_BASE_URL || "http://localhost:3000";
const now = new Date().toISOString();

const company = {
  id: "auditco",
  name: "Audit Co",
  ticker: "AUDT",
  exchange: "NYSE",
  country: "US",
  sector: "Industrials",
  industry: "Testing"
};

function evidence(id, source, category, title, description, confidence = "medium", keywords = []) {
  return {
    id,
    source,
    provider: source === "finance" ? "Yahoo Finance" : source === "patents" ? "PatentsView" : "NewsAPI",
    category,
    companyId: company.id,
    ticker: company.ticker,
    title,
    description,
    capturedAt: now,
    publishedAt: now,
    reliability: 0.8,
    confidence,
    matchedKeywords: keywords,
    tags: keywords,
    rawMetadata: {}
  };
}

async function analyse(name, items) {
  const response = await fetch(`${baseUrl}/api/intelligence/analyse`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ company, evidence: items })
  });
  if (!response.ok) throw new Error(`${name} returned HTTP ${response.status}`);
  const payload = await response.json();
  return payload.data;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const cases = [
  {
    name: "zero evidence",
    items: [],
    check(result) {
      assert(result.status === "insufficient_evidence", "zero evidence must be insufficient");
      assert(result.scores === null, "zero evidence must not score");
      assert(result.classification === "Insufficient Evidence", "zero evidence classification must be Insufficient Evidence");
      assert(result.verdict === "INSUFFICIENT DATA", "zero evidence verdict must be INSUFFICIENT DATA");
    }
  },
  {
    name: "one weak evidence",
    items: [evidence("weak_1", "news", "news", "Company mentions renewable energy", "A brief renewable energy mention.", "low", ["renewable"])],
    check(result) {
      assert(result.status === "insufficient_evidence", "one weak evidence item must be insufficient");
      assert(result.scores === null, "one weak evidence item must not score");
    }
  },
  {
    name: "three ESG evidence",
    items: [
      evidence("esg_env_1", "news", "news", "Carbon reduction improves renewable energy profile", "Climate and emissions progress improves.", "high", ["carbon", "renewable"]),
      evidence("esg_soc_1", "news", "news", "Worker safety program improves labour practices", "Safety and labour progress improves.", "high", ["safety", "labour"]),
      evidence("esg_dig_1", "patents", "patent", "Responsible AI cybersecurity patent", "Digital innovation improves responsible AI and cybersecurity.", "high", ["responsible ai", "cybersecurity"])
    ],
    check(result) {
      assert(result.status === "complete", "three ESG evidence items should score");
      assert(result.scores && typeof result.scores.overall === "number", "three ESG evidence items need scores");
      assert(result.classification !== "Insufficient Evidence", "three ESG evidence items need classification");
      assert(result.verdict !== "INSUFFICIENT DATA", "three ESG evidence items need verdict");
      assert(result.explanation.evidenceReferences.length >= 3, "explanations must reference evidence IDs");
    }
  },
  {
    name: "market trend only",
    items: [evidence("market_1", "finance", "market", "Market trend evidence for AUDT", "Yahoo Finance market performance. This is market intelligence, not ESG scoring.", "medium", [])],
    check(result) {
      assert(result.status === "insufficient_evidence", "market-only evidence must be insufficient");
      assert(result.verdict !== "BUY SIGNAL", "market-only evidence cannot create Buy Signal");
      assert(result.scores === null, "market-only evidence must not score");
    }
  },
  {
    name: "random company object",
    items: [evidence("random_1", "news", "news", "Renewable energy update", "Carbon and renewable activity improved.", "low", ["carbon"])],
    check(result) {
      assert(result.company.name === company.name, "engine must accept arbitrary resolved company objects");
      assert(result.status === "insufficient_evidence", "random weak evidence remains insufficient");
    }
  }
];

for (const testCase of cases) {
  const result = await analyse(testCase.name, testCase.items);
  testCase.check(result);
  console.log(`PASS ${testCase.name}`);
}

const unknown = await fetch(`${baseUrl}/api/intelligence/company/UNKNOWN_COMPANY_DOES_NOT_EXIST`);
assert(unknown.status === 404 || unknown.ok, "unknown company route should return a controlled response");
console.log("PASS unknown company controlled response");
