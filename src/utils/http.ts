export type ProviderFailureCode = "missing_api_key" | "timeout" | "rate_limited" | "error";

export class ProviderError extends Error {
  constructor(
    readonly code: ProviderFailureCode,
    message: string,
    readonly statusCode?: number
  ) {
    super(message);
  }
}

export async function fetchJson<T>(url: string, timeoutMs = 9000, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        accept: "application/json,text/plain,*/*",
        "user-agent": "ESG-Pulse-360/0.2",
        ...(init?.headers || {})
      }
    });

    if (response.status === 429) {
      throw new ProviderError("rate_limited", "Provider rate limit reached.", response.status);
    }

    if (!response.ok) {
      throw new ProviderError("error", `${response.status} ${response.statusText}`, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ProviderError("timeout", "Provider request timed out.");
    }
    throw new ProviderError("error", error instanceof Error ? error.message : "Provider request failed.");
  } finally {
    clearTimeout(timer);
  }
}
