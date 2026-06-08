const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const PORT = Number(process.env.PORT || 4173);
const PUBLIC_DIR = path.join(__dirname, "public");

const COMPANIES = [
  { id: "DBS", name: "DBS Group", ticker: "D05.SI", region: "Singapore", sector: "Banking", beta: 0.82 },
  { id: "GRAB", name: "Grab Holdings", ticker: "GRAB", region: "ASEAN", sector: "Mobility", beta: 1.34 },
  { id: "SE", name: "Sea Limited", ticker: "SE", region: "ASEAN", sector: "Technology", beta: 1.58 },
  { id: "Singtel", name: "Singtel", ticker: "Z74.SI", region: "Singapore", sector: "Telecom", beta: 0.72 },
  { id: "Wilmar", name: "Wilmar International", ticker: "F34.SI", region: "ASEAN", sector: "Food & Agriculture", beta: 0.95 },
  { id: "AIA", name: "AIA Group", ticker: "1299.HK", region: "Asia", sector: "Insurance", beta: 0.86 },
  { id: "UOB", name: "UOB", ticker: "U11.SI", region: "Singapore", sector: "Banking", beta: 0.79 },
  { id: "OCBC", name: "OCBC Bank", ticker: "O39.SI", region: "Singapore", sector: "Banking", beta: 0.77 },
  { id: "CapitaLand", name: "CapitaLand Investment", ticker: "9CI.SI", region: "Singapore", sector: "Real Estate", beta: 0.91 },
  { id: "Keppel", name: "Keppel", ticker: "BN4.SI", region: "Singapore", sector: "Infrastructure", beta: 1.02 }
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const cache = new Map();

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store",
    "access-control-allow-origin": "*"
  });
  res.end(body);
}

function json(res, status, payload) {
  send(res, status, JSON.stringify(payload), "application/json; charset=utf-8");
}

async function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < ttlMs) return hit.value;
  const value = await fn();
  cache.set(key, { time: Date.now(), value });
  return value;
}

async function fetchJson(url, timeoutMs = 7500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "ESG-Legends-Hackathon/1.0",
        "accept": "application/json,text/plain,*/*"
      }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url, timeoutMs = 7500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "ESG-Legends-Hackathon/1.0",
        "accept": "application/rss+xml,text/xml,text/plain,*/*"
      }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function gdeltUrl(query, maxrecords = 18) {
  const params = new URLSearchParams({
    query,
    mode: "artlist",
    format: "json",
    sort: "datedesc",
    maxrecords: String(maxrecords)
  });
  return `https://api.gdeltproject.org/api/v2/doc/doc?${params}`;
}

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function textBetween(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decodeXml(match?.[1]?.trim() || "");
}

function parseTone(article) {
  const text = `${article.title || ""} ${article.seendate || ""}`.toLowerCase();
  let score = 0;
  const positive = ["green", "renewable", "sustainable", "transition", "carbon", "climate", "clean", "impact", "governance", "inclusive", "electric"];
  const negative = ["lawsuit", "probe", "pollution", "coal", "fraud", "strike", "controversy", "fine", "emission breach", "deforestation"];
  positive.forEach((word) => { if (text.includes(word)) score += 1; });
  negative.forEach((word) => { if (text.includes(word)) score -= 1.4; });
  return score;
}

async function getNews(company) {
  const query = `${company.name} sustainability OR ESG OR climate OR governance OR renewable`;
  const rssUrl = `https://news.google.com/rss/search?${new URLSearchParams({ q: query, hl: "en-SG", gl: "SG", ceid: "SG:en" })}`;
  try {
    const xml = await fetchText(rssUrl);
    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 14).map((match) => {
      const item = match[1];
      const title = textBetween(item, "title").replace(/\s+-\s+[^-]+$/, "");
      const url = textBetween(item, "link");
      const source = textBetween(item, "source") || "Google News";
      return {
        title,
        url,
        source,
        domain: source,
        seenDate: textBetween(item, "pubDate"),
        tone: parseTone({ title })
      };
    });
  } catch {
    const data = await fetchJson(gdeltUrl(query, 8));
    return (data.articles || []).slice(0, 8).map((article) => ({
      title: article.title,
      url: article.url,
      source: article.sourcecountry || article.domain || "Live source",
      domain: article.domain,
      seenDate: article.seendate,
      tone: parseTone(article)
    }));
  }
}

async function getMarket(company) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(company.ticker)}?range=3mo&interval=1d`;
  const data = await fetchJson(url);
  const result = data.chart?.result?.[0];
  if (!result) throw new Error("No market data");
  const quote = result.indicators?.quote?.[0] || {};
  const closes = (quote.close || []).filter((n) => Number.isFinite(n));
  const last = closes.at(-1) || 0;
  const first = closes.find((n) => n > 0) || last || 1;
  const change = first ? ((last - first) / first) * 100 : 0;
  const currency = result.meta?.currency || "";
  return {
    ticker: company.ticker,
    price: Number(last.toFixed(3)),
    currency,
    change3m: Number(change.toFixed(2)),
    source: "Yahoo Finance chart"
  };
}

function signalScore(news, market, company) {
  const volume = Math.min(24, news.length * 2.2);
  const tone = news.reduce((sum, article) => sum + article.tone, 0);
  const marketPulse = Math.max(-8, Math.min(8, (market?.change3m || 0) / 2));
  const stability = 7 - Math.min(6, Math.abs(company.beta - 1) * 5);
  const raw = 58 + volume + tone * 4 + marketPulse + stability;
  return Math.max(34, Math.min(96, Math.round(raw)));
}

function keywordSignal(news, pattern, base, weight) {
  const matches = news.filter((article) => pattern.test(article.title)).length;
  const tone = news.reduce((sum, article) => sum + article.tone, 0);
  return Math.max(32, Math.min(96, Math.round(base + matches * weight + news.length * 1.1 + tone * 2.5)));
}

async function companySnapshot(company) {
  const [newsResult, marketResult] = await Promise.allSettled([getNews(company), getMarket(company)]);
  const news = newsResult.status === "fulfilled" ? newsResult.value : [];
  const market = marketResult.status === "fulfilled" ? marketResult.value : null;
  const momentum = signalScore(news, market, company);
  const confidence = Math.max(54, Math.min(96, Math.round(62 + news.length * 1.6 + Math.abs(market?.change3m || 0) * 0.45)));
  const hiddenUpside = Math.max(0, Math.round((momentum - 63) * 1.7 + (confidence - 70) * 0.7));
  return {
    ...company,
    momentum,
    confidence,
    hiddenUpside,
    news,
    market,
    signals: {
      news: keywordSignal(news, /sustainability|esg|green|climate|renewable|governance|carbon/i, 48, 4),
      hiring: keywordSignal(news, /hiring|jobs|talent|specialist|department|workforce|training/i, 43, 12),
      patent: keywordSignal(news, /patent|innovation|technology|clean|renewable|ai|electric|transition/i, 42, 10),
      emissions: keywordSignal(news, /emission|carbon|climate|renewable|solar|green|energy|decarbon/i, 47, 10),
      governance: keywordSignal(news, /governance|board|risk|compliance|audit|shareholder|investor|vote/i, 49, 12)
    },
    updatedAt: new Date().toISOString()
  };
}

async function liveUniverse() {
  return cached("universe", 1000 * 60 * 6, async () => {
    const results = await Promise.allSettled(COMPANIES.map(companySnapshot));
    const companies = results.map((result, index) => (
      result.status === "fulfilled"
        ? result.value
        : { ...COMPANIES[index], momentum: 55, confidence: 50, hiddenUpside: 0, news: [], market: null, signals: {}, error: result.reason?.message }
    ));
    companies.sort((a, b) => b.hiddenUpside - a.hiddenUpside || b.momentum - a.momentum);
    return { generatedAt: new Date().toISOString(), companies };
  });
}

function serveFile(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const target = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!target.startsWith(PUBLIC_DIR)) return send(res, 403, "Forbidden", "text/plain; charset=utf-8");
  fs.readFile(target, (error, data) => {
    if (error) return send(res, 404, "Not found", "text/plain; charset=utf-8");
    send(res, 200, data, MIME[path.extname(target)] || "application/octet-stream");
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/api/universe") return json(res, 200, await liveUniverse());
    if (url.pathname === "/api/battle") {
      const universe = await liveUniverse();
      const a = universe.companies.find((company) => company.id === url.searchParams.get("a")) || universe.companies[0];
      const b = universe.companies.find((company) => company.id === url.searchParams.get("b")) || universe.companies[1];
      return json(res, 200, { a, b, generatedAt: universe.generatedAt });
    }
    serveFile(req, res);
  } catch (error) {
    json(res, 500, { error: error.message || "Unexpected server error" });
  }
});

server.listen(PORT, () => {
  console.log(`ESG Legends live at http://localhost:${PORT}`);
});
