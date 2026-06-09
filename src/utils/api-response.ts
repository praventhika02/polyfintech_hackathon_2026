import type { ApiResponse } from "@/types";

export function createApiResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    meta: {
      requestId: crypto.randomUUID(),
      generatedAt: new Date().toISOString()
    }
  };
}
