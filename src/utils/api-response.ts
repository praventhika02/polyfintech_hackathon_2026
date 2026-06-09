import type { ApiResponse } from "@/types";

export function createApiResponse<T>(data: T, documentation?: string): ApiResponse<T> {
  return {
    data,
    meta: {
      requestId: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      documentation
    }
  };
}
