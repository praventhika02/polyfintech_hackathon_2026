import { existsSync } from "fs";
import path from "path";
import type { EsgCategory, MlModelHealth, MlModelRuntimeStatus, MlRuntimeHealth, SentimentLabel } from "@/types/intelligence";

export const LOCAL_HF_MODELS = {
  esgClassifier: "yiyanghkust/finbert-esg",
  sentiment: "ProsusAI/finbert",
  zeroShot: "facebook/bart-large-mnli",
  summarizer: "facebook/bart-large-cnn",
  embeddings: "sentence-transformers/all-MiniLM-L6-v2"
} as const;

type ModelKey = keyof typeof LOCAL_HF_MODELS;
type HealthKey = keyof MlRuntimeHealth["mlRuntime"]["models"];
type PipelineOutput = { label: string; score: number };
type PipelineFunction = (input: string | string[], options?: Record<string, unknown>) => Promise<unknown>;
type TransformersModule = {
  env: {
    allowRemoteModels: boolean;
    allowLocalModels: boolean;
    cacheDir?: string;
    localModelPath?: string;
  };
  pipeline: (task: string, model: string, options?: Record<string, unknown>) => Promise<PipelineFunction>;
};

type ModelConfig = {
  healthKey: HealthKey;
  task: string;
  modelId: string;
  runtimeModelId: string;
};

type ModelState = MlModelHealth & {
  task: string;
  startedAt: string | null;
  finishedAt: string | null;
};

type ClassifiedRuntimeStatus = "loaded" | "loading" | "not_loaded" | "unsupported" | "error" | "fallback";

const MODEL_LOAD_TIMEOUT_MS = 10_000;

const MODEL_CONFIG: Record<ModelKey, ModelConfig> = {
  esgClassifier: {
    healthKey: "finbert_esg",
    task: "text-classification",
    modelId: LOCAL_HF_MODELS.esgClassifier,
    runtimeModelId: process.env.HF_FINBERT_ESG_MODEL || LOCAL_HF_MODELS.esgClassifier
  },
  sentiment: {
    healthKey: "finbert_sentiment",
    task: "sentiment-analysis",
    modelId: LOCAL_HF_MODELS.sentiment,
    runtimeModelId: process.env.HF_FINBERT_SENTIMENT_MODEL || LOCAL_HF_MODELS.sentiment
  },
  zeroShot: {
    healthKey: "bart_mnli",
    task: "zero-shot-classification",
    modelId: LOCAL_HF_MODELS.zeroShot,
    runtimeModelId: process.env.HF_BART_MNLI_MODEL || "Xenova/bart-large-mnli"
  },
  summarizer: {
    healthKey: "bart_cnn",
    task: "summarization",
    modelId: LOCAL_HF_MODELS.summarizer,
    runtimeModelId: process.env.HF_BART_CNN_MODEL || "Xenova/distilbart-cnn-6-6"
  },
  embeddings: {
    healthKey: "minilm",
    task: "feature-extraction",
    modelId: LOCAL_HF_MODELS.embeddings,
    runtimeModelId: process.env.HF_MINILM_MODEL || "Xenova/all-MiniLM-L6-v2"
  }
};

function defaultModelState(config: ModelConfig): ModelState {
  return {
    task: config.task,
    status: "not_loaded",
    modelId: config.modelId,
    runtimeModelId: config.runtimeModelId,
    mode: "keyword_fallback",
    error: null,
    startedAt: null,
    finishedAt: null
  };
}

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

function cachePath(): string {
  return process.env.TRANSFORMERS_CACHE || process.env.HF_HOME || process.env.XENOVA_CACHE_DIR || path.join(process.cwd(), "models");
}

function dependencyPath(): string {
  return path.join(process.cwd(), "node_modules", "@xenova", "transformers");
}

function modelErrorStatus(error: Error): Extract<MlModelRuntimeStatus, "unsupported" | "error"> {
  const message = error.message.toLowerCase();
  if (message.includes("unsupported") || message.includes("no available model") || message.includes("could not locate file") || message.includes("onnx")) {
    return "unsupported";
  }
  return "error";
}

function timeoutPromise(modelId: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Model loading timed out after ${MODEL_LOAD_TIMEOUT_MS / 1000}s: ${modelId}`)), MODEL_LOAD_TIMEOUT_MS);
  });
}

class LocalModelRegistry {
  private transformersPromise: Promise<TransformersModule | null> | null = null;
  private loadError: string | null = null;
  private pipelines: Partial<Record<ModelKey, PipelineFunction>> = {};
  private modelPromises: Partial<Record<ModelKey, Promise<void>>> = {};
  private modelStates = Object.fromEntries(
    Object.entries(MODEL_CONFIG).map(([key, config]) => [key, defaultModelState(config)])
  ) as Record<ModelKey, ModelState>;
  private readonly modelNames = Object.values(LOCAL_HF_MODELS);

  names(): string[] {
    return this.modelNames;
  }

  startBackgroundLoading(): void {
    if (process.env.ENABLE_LOCAL_HF_PIPELINES !== "true") return;
    for (const key of Object.keys(MODEL_CONFIG) as ModelKey[]) {
      this.ensureModelLoading(key);
    }
  }

  async classifyEsg(text: string): Promise<{ category: EsgCategory; confidence: number; modelName: string; runtimeStatus: ClassifiedRuntimeStatus } | null> {
    this.ensureModelLoading("esgClassifier");
    const state = this.modelStates.esgClassifier;
    const pipeline = this.pipelines.esgClassifier;
    if (!pipeline || state.status !== "loaded") return null;
    const output = normalizePipelineOutput(await pipeline(text));
    if (!output) return null;
    const label = output.label.toLowerCase();
    const category = label.includes("environment") ? "Environmental" : label.includes("social") ? "Social" : label.includes("governance") ? "Governance" : "Non-ESG";
    return { category, confidence: Math.max(0, Math.min(0.99, output.score)), modelName: state.runtimeModelId, runtimeStatus: "loaded" };
  }

  async classifySentiment(text: string): Promise<{ label: SentimentLabel; confidence: number; modelName: string; runtimeStatus: ClassifiedRuntimeStatus } | null> {
    this.ensureModelLoading("sentiment");
    const state = this.modelStates.sentiment;
    const pipeline = this.pipelines.sentiment;
    if (!pipeline || state.status !== "loaded") return null;
    const output = normalizePipelineOutput(await pipeline(text));
    if (!output) return null;
    const label = output.label.toLowerCase();
    const sentiment = label.includes("positive") ? "Positive" : label.includes("negative") ? "Negative" : "Neutral";
    return { label: sentiment, confidence: Math.max(0, Math.min(0.99, output.score)), modelName: state.runtimeModelId, runtimeStatus: "loaded" };
  }

  modelState(key: ModelKey): ModelState {
    return this.modelStates[key];
  }

  health(): MlRuntimeHealth {
    const enabled = process.env.ENABLE_LOCAL_HF_PIPELINES === "true";
    if (enabled) {
      this.startBackgroundLoading();
    }

    const states: MlRuntimeHealth["mlRuntime"]["models"] = {
      finbert_esg: this.modelStates.esgClassifier,
      finbert_sentiment: this.modelStates.sentiment,
      bart_mnli: this.modelStates.zeroShot,
      bart_cnn: this.modelStates.summarizer,
      minilm: this.modelStates.embeddings
    };
    const loadedCount = Object.values(states).filter((state) => state.status === "loaded").length;
    const loadingCount = Object.values(states).filter((state) => state.status === "loading").length;
    const mode = loadedCount === Object.keys(states).length
      ? "local_huggingface"
      : loadedCount > 0 || loadingCount > 0
        ? "mixed"
        : "keyword_fallback";

    return {
      status: "ok",
      mlRuntime: {
        enabled,
        mode,
        runtime: enabled && existsSync(dependencyPath()) ? "xenova_transformers" : "unavailable",
        fallbackActive: mode !== "local_huggingface",
        dependencyInstalled: existsSync(dependencyPath()),
        modelCacheExists: existsSync(cachePath()),
        modelCachePath: cachePath(),
        env: {
          ENABLE_LOCAL_HF_PIPELINES: process.env.ENABLE_LOCAL_HF_PIPELINES || null,
          HF_ALLOW_REMOTE_MODEL_DOWNLOAD: process.env.HF_ALLOW_REMOTE_MODEL_DOWNLOAD || null,
          TRANSFORMERS_CACHE: process.env.TRANSFORMERS_CACHE || null,
          HF_HOME: process.env.HF_HOME || null,
          XENOVA_CACHE_DIR: process.env.XENOVA_CACHE_DIR || null,
          HF_FINBERT_ESG_MODEL: process.env.HF_FINBERT_ESG_MODEL || null,
          HF_FINBERT_SENTIMENT_MODEL: process.env.HF_FINBERT_SENTIMENT_MODEL || null,
          HF_BART_MNLI_MODEL: process.env.HF_BART_MNLI_MODEL || null,
          HF_BART_CNN_MODEL: process.env.HF_BART_CNN_MODEL || null,
          HF_MINILM_MODEL: process.env.HF_MINILM_MODEL || null,
          NODE_ENV: process.env.NODE_ENV || null
        },
        loadError: this.loadError,
        models: states
      }
    };
  }

  private ensureModelLoading(key: ModelKey): void {
    if (process.env.ENABLE_LOCAL_HF_PIPELINES !== "true") return;
    const state = this.modelStates[key];
    if (state.status === "loaded" || state.status === "loading" || state.status === "unsupported" || state.status === "error") {
      return;
    }

    const config = MODEL_CONFIG[key];
    this.modelStates[key] = {
      ...state,
      status: "loading",
      mode: "keyword_fallback",
      error: null,
      startedAt: new Date().toISOString(),
      finishedAt: null
    };

    this.modelPromises[key] = this.loadModel(key, config).catch(() => {
      // loadModel records terminal state; this catch prevents unhandled rejections.
    });
  }

  private async transformers(): Promise<TransformersModule | null> {
    if (!this.transformersPromise) {
      this.transformersPromise = this.importTransformers();
    }
    return this.transformersPromise;
  }

  private async importTransformers(): Promise<TransformersModule | null> {
    try {
      const importer = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<unknown>;
      const module = await importer("@xenova/transformers");
      if (!isTransformersModule(module)) {
        this.loadError = "@xenova/transformers did not expose the expected pipeline runtime.";
        return null;
      }
      module.env.allowLocalModels = true;
      module.env.allowRemoteModels = process.env.HF_ALLOW_REMOTE_MODEL_DOWNLOAD !== "false";
      module.env.cacheDir = cachePath();
      module.env.localModelPath = cachePath();
      return module;
    } catch (error) {
      this.loadError = error instanceof Error ? error.message : "Local HuggingFace runtime import failed.";
      return null;
    }
  }

  private async loadModel(key: ModelKey, config: ModelConfig): Promise<void> {
    const module = await this.transformers();
    if (!module) {
      this.setTerminalState(key, "error", this.loadError || "Local HuggingFace runtime is unavailable.");
      return;
    }

    try {
      this.pipelines[key] = await Promise.race([
        module.pipeline(config.task, config.runtimeModelId),
        timeoutPromise(config.runtimeModelId)
      ]);
      this.modelStates[key] = {
        ...defaultModelState(config),
        status: "loaded",
        mode: "local_huggingface",
        error: null,
        startedAt: this.modelStates[key].startedAt,
        finishedAt: new Date().toISOString()
      };
      this.loadError = null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Model loading failed.";
      this.setTerminalState(key, error instanceof Error ? modelErrorStatus(error) : "error", message);
    }
  }

  private setTerminalState(key: ModelKey, status: Extract<MlModelRuntimeStatus, "unsupported" | "error">, error: string): void {
    const config = MODEL_CONFIG[key];
    this.modelStates[key] = {
      ...defaultModelState(config),
      status,
      mode: "keyword_fallback",
      error,
      startedAt: this.modelStates[key].startedAt,
      finishedAt: new Date().toISOString()
    };
    delete this.modelPromises[key];
    this.loadError = Object.values(this.modelStates).some((state) => state.status === "loaded")
      ? null
      : "No local HuggingFace-compatible models loaded. Keyword fallback is active.";
  }
}

export const localModelRegistry = new LocalModelRegistry();
