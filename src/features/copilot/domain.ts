import type { CopilotMessage } from "@/types";

export type CopilotRequest = {
  conversationId?: string;
  message: string;
};

export type CopilotResult = {
  message: CopilotMessage;
};
