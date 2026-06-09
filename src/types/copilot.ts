import type { EvidenceItem } from "./evidence";

export type CopilotMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  evidence?: EvidenceItem[];
};

export type CopilotConversation = {
  id: string;
  title: string;
  messages: CopilotMessage[];
  updatedAt: string;
};
