import type { ApiResponse } from "@/types";

export async function fetchApi<T>(input: RequestInfo | URL, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(input, init);
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return payload;
}
