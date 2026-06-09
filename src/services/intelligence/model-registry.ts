import { existsSync } from "fs";
import path from "path";
import type { EsgCategory, MlRuntimeHealth, SentimentLabel } from "@/types/intelligence";

export const LOCAL_HF_MODELS = {
  esgClassifier: "yiyanghkust/finbert-esg",
  sentiment: "ProsusAI/finbert",
  zeroShot: "facebook/bart-large-mnli",
  summarizer: "facebook/bart-large-cnn",
  embeddings: "sentence-transformers/all-MiniLM-L6-v2"
} as const;

type ModelKey = keyof typeof LOCAL_HF_MODELS;
type PipelineOutput = { label: string; score: number };
type PipelineFunction = (input: string, options?: { candidate_labels?: string[] }) => Promise<unknown>;
type PipelineMap = Partial<Record<ModelKey, PipelineFunction>>;
type TransformersModule = {
  env: {
    allowRemoteModels: boolean;
    allowLocalModels: boolean;
    cacheDir?: string;
  };
  pipeline: (task: string, model: string) => Promise<PipelineFunction>;
};

const HEALTH_MODEL_KEYS: Record<ModelKey, keyof MlRuntimeHealth["mlRuntime"]["models"]> = {
  esgClassifier: "finbert_esg",
  sentiment: "finbert_sentiment",
  zeroShot: "bart_mnli",
  summarizer: "bart_cnn",
  embeddings: "minilm"
};

function isTransformersModule(value: unknown): value is TransformersModule {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { env?: unknown; pipeline?: unknown };
  return typeof candidate.pipeline === "function" && Boolean(candidate.env) && typeof candidate.env === "object";
}

function normalizePipelineOutput(output: unknown): PipelineOutput | null {
  const first = Array.isArray(output) ? output[0] : output;
  if (!first || typeof first !== "object") return null;
  const candidate = first as { label?: unknown; score?: unknown };
  if (typeof candidate.label !== "string" || typeof candidate.score !== "number") return null;
  return { label: candidate.label, score: candidate.score };
}

function cachePath(): string | null {
  return process.env.TRANSFORMERS_CACHE || process.env.HF_HOME || process.env.XENOVA_CACHE_DIR || path.join(process.cwd(), "models");
}

class LocalModelRegistry {
  private loadPromise: Promise<PipelineMap> | null = null;
  private loadError: string | null = null;
  private readonly modelNames = Object.values(LOCAL_HF_MODELS);

  async loadOnce(): Promise<PipelineMap> {
    if (!this.loadPromise) {
      this.loadPromise = this.loadLocalPipelines();
    }
    return this.loadPromise;
  }

  names(): string[] {
    return this.modelNames;
  }

  async runtimeMode(): Promise<"local_huggingface" | "keyword_fallback"> {
    const pipelines = await this.loadOnce();
    return pipelines.esgClassifier && pipelines.sentiment ? "local_huggingface" : "keyword_fallback";
  }

  async classifyEsg(text: string): Promise<{ category: EsgCategory; confidence: number } | null> {
    const pipelines = await this.loadOnce();
    if (!pipelines.esgClassifier) return null;
    const output = normalizePipelineOutput(await pipelines.esgClassifier(text));
    if (!output) return null;
    const label = output.label.toLowerCase();
    const category = label.includes("environment") ? "Environmental" : label.includes("social") ? "Social" : label.includes("governance") ? "Governance" : "Non-ESG";
    return { category, confidence: Math.max(0, Math.min(0.99, output.score)) };
  }

  async classifySentiment(text: string): Promise<{ label: SentimentLabel; confidence: number } | null> {
    const pipelines = await this.loadOnce();
    if (!pipelines.sentiment) return null;
    const output = normalizePipelineOutput(await pipelines.sentiment(text));
    if (!output) return null;
    const label = output.label.toLowerCase();
    const sentiment = label.includes("positive") ? "Positive" : label.includes("negative") ? "Negative" : "Neutral";
    return { label: sentiment, confidence: Math.max(0, Math.min(0.99, output.score)) };
  }

  async health(): Promise<MlRuntimeHealth> {
    const enabled = process.env.ENABLE_LOCAL_HF_PIPELINES === "true";
    const configuredCachePath = cachePath();
    const dependencyPath = path.join(process.cwd(), "node_modules", "@xenova", "transformers");
    const pipelines = await this.loadOnce();
    const modelStatuses = Object.fromEntries(
      Object.entries(HEALTH_MODEL_KEYS).map(([pipelineKey, healthKey]) => [healthKey, pipelines[pipelineKey as ModelKey] ? "loaded" : "not_loaded"])
    ) as MlRuntimeHealth["mlRuntime"]["models"];
    const localReady = Object.values(modelStatuses).every((status) => status === "loaded");

    return {
      status: "ok",
      mlRuntime: {
        enabled,
        mode: enabled && localReady ? "local_huggingface" : "keyword_fallback",
        runtime: enabled && existsSync(dependencyPath) ? "xenova_transformers" : "unavailable",
        fallbackActive: !enabled || !localReady,
        dependencyInstalled: existsSync(dependencyPath),
        modelCacheExists: configuredCachePath ? existsSync(configuredCachePath) : false,
        modelCachePath: configuredCachePath,
        env: {
          ENABLE_LOCAL_HF_PIPELINES: process.env.ENABLE_LOCAL_HF_PIPELINES || null,
          TRANSFORMERS_CACHE: process.env.TRANSFORMERS_CACHE || null,
          HF_HOME: process.env.HF_HOME || null,
          XENOVA_CACHE_DIR: process.env.XENOVA_CACHE_DIR || null,
          NODE_ENV: process.env.NODE_ENV || null
        },
        loadError: this.loadError,
        models: modelStatuses
      }
    };
  }

  private async loadLocalPipelines(): Promise<PipelineMap> {
    if (process.env.ENABLE_LOCAL_HF_PIPELINES !== "true") {
      return {};
    }
    try {
      const importer = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<unknown>;
      const module = await importer("@xenova/transformers");
      if (!isTransformersModule(module)) {
        this.loadError = "@xenova/transformers did not expose the expected pipeline runtime.";
        return {};
      }
      module.env.allowRemoteModels = false;
      module.env.allowLocalModels = true;
      const pipelines: PipelineMap = {
        esgClassifier: await module.pipeline("text-classification", LOCAL_HF_MODELS.esgClassifier),
        sentiment: await module.pipeline("sentiment-analysis", LOCAL_HF_MODELS.sentiment),
        zeroShot: await module.pipeline("zero-shot-classification", LOCAL_HF_MODELS.zeroShot),
        summarizer: await module.pipeline("summarization", LOCAL_HF_MODELS.summarizer),
        embeddings: await module.pipeline("feature-extraction", LOCAL_HF_MODELS.embeddings)
      };
      this.loadError = null;
      return pipelines;
    } catch (error) {
      this.loadError = error instanceof Error ? error.message : "Local HuggingFace pipeline loading failed.";
      return {};
    }
  }
}

export const localModelRegistry = new LocalModelRegistry();
