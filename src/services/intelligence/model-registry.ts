export const LOCAL_HF_MODELS = {
  esgClassifier: "yiyanghkust/finbert-esg",
  sentiment: "ProsusAI/finbert",
  zeroShot: "facebook/bart-large-mnli",
  summarizer: "facebook/bart-large-cnn",
  embeddings: "sentence-transformers/all-MiniLM-L6-v2"
} as const;

type PipelineMap = Partial<Record<keyof typeof LOCAL_HF_MODELS, unknown>>;

class LocalModelRegistry {
  private loadPromise: Promise<PipelineMap> | null = null;
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

  health() {
    return {
      status: "configured",
      runtime: "local-huggingface-singleton",
      models: LOCAL_HF_MODELS,
      note: "Pipelines are loaded once when a local transformers runtime is available; deterministic evidence-only fallbacks keep API routes operational without external LLM APIs."
    };
  }

  private async loadLocalPipelines(): Promise<PipelineMap> {
    if (process.env.ENABLE_LOCAL_HF_PIPELINES !== "true") {
      return {};
    }
    try {
      const importer = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<any>;
      const transformers = await importer("@xenova/transformers");
      transformers.env.allowRemoteModels = false;
      transformers.env.allowLocalModels = true;
      return {
        esgClassifier: await transformers.pipeline("text-classification", LOCAL_HF_MODELS.esgClassifier),
        sentiment: await transformers.pipeline("sentiment-analysis", LOCAL_HF_MODELS.sentiment),
        zeroShot: await transformers.pipeline("zero-shot-classification", LOCAL_HF_MODELS.zeroShot),
        summarizer: await transformers.pipeline("summarization", LOCAL_HF_MODELS.summarizer),
        embeddings: await transformers.pipeline("feature-extraction", LOCAL_HF_MODELS.embeddings)
      };
    } catch {
      return {};
    }
  }
}

export const localModelRegistry = new LocalModelRegistry();
