import type { CopilotRequest, CopilotResult } from "./domain";

export async function askCopilot(request: CopilotRequest): Promise<CopilotResult> {
  return {
    message: {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Copilot foundation received: ${request.message}`,
      createdAt: new Date().toISOString()
    }
  };
}
