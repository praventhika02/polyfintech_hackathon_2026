import { mkdirSync, rmSync } from "fs";
import { spawn } from "child_process";
import path from "path";

const root = process.cwd();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(port) {
  const url = `http://localhost:${port}/api/intelligence/health`;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // Server is still starting.
    }
    await sleep(1000);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function withServer(port, env, run) {
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(command, ["run", "dev", "--", "-p", String(port)], {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: "ignore",
    windowsHide: true,
    shell: process.platform === "win32"
  });
  try {
    const health = await waitForHealth(port);
    await run(health);
  } finally {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore", windowsHide: true });
    } else {
      child.kill("SIGTERM");
    }
    await sleep(1000);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const noCache = path.join(root, ".tmp-empty-model-cache");
rmSync(noCache, { recursive: true, force: true });
mkdirSync(noCache, { recursive: true });

await withServer(3201, { ENABLE_LOCAL_HF_PIPELINES: "false", TRANSFORMERS_CACHE: noCache }, async (health) => {
  assert(health.data.mlRuntime.mode === "keyword_fallback", "disabled runtime must report keyword_fallback mode");
  assert(health.data.mlRuntime.fallbackActive === true, "disabled runtime must report fallback active");
  console.log("PASS health disabled fallback mode");
});

await withServer(
  3202,
  {
    ENABLE_LOCAL_HF_PIPELINES: "true",
    HF_ALLOW_REMOTE_MODEL_DOWNLOAD: "false",
    TRANSFORMERS_CACHE: noCache
  },
  async (health) => {
    const runtime = health.data.mlRuntime;
    assert(runtime.enabled === true, "enabled runtime must report enabled=true");
    assert(runtime.mode === "keyword_fallback" || runtime.mode === "mixed", "unavailable models must not be reported as fully local");
    assert(Object.values(runtime.models).every((model) => model.status !== "loaded"), "empty cache with remote disabled should not mark models loaded");

    const now = new Date().toISOString();
    const body = {
      evidence: [
        {
          id: "ml_unavailable_1",
          source: "news",
          provider: "NewsAPI",
          category: "news",
          title: "Company improves renewable energy and carbon emissions progress",
          description: "Renewable energy and carbon emissions evidence from a real news text.",
          capturedAt: now,
          publishedAt: now,
          reliability: 0.8,
          confidence: "high",
          matchedKeywords: ["renewable", "carbon"],
          tags: ["renewable", "carbon"],
          rawMetadata: {}
        }
      ]
    };
    const response = await fetch("http://localhost:3202/api/intelligence/classify-evidence", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    assert(response.ok, "classification route must not crash when model loading fails");
    const classified = (await response.json()).data.classified[0];
    assert(classified.modelMode === "keyword_fallback", "unavailable model classification must use keyword_fallback");
    assert(classified.classificationConfidence <= 0.45, "fallback classification confidence must be capped at 0.45");
    assert(classified.sentiment.confidence <= 0.45, "fallback sentiment confidence must be capped at 0.45");
    console.log("PASS enabled unavailable models transparent fallback");
  }
);

rmSync(noCache, { recursive: true, force: true });
