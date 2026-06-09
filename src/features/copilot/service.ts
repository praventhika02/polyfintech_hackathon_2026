import type { CopilotRequest, CopilotResult } from "./domain";

export async function askCopilot(request: CopilotRequest): Promise<CopilotResult> {
  return {
    message: {
      id: crypto.randomUUID(),
      role: "assistant",
      content: request.message ? "Insufficient evidence available." : "Insufficient evidence available.",
      createdAt: new Date().toISOString()
    }
  };
}
