"use client";

import { create } from "zustand";
import type { CopilotConversation, CopilotMessage } from "@/types";

type CopilotState = {
  conversation: CopilotConversation | null;
  pending: boolean;
  setConversation: (conversation: CopilotConversation | null) => void;
  appendMessage: (message: CopilotMessage) => void;
  setPending: (pending: boolean) => void;
};

export const useCopilotStore = create<CopilotState>((set) => ({
  conversation: null,
  pending: false,
  setConversation: (conversation) => set({ conversation }),
  appendMessage: (message) =>
    set((state) => {
      if (!state.conversation) return state;
      return {
        conversation: {
          ...state.conversation,
          messages: [...state.conversation.messages, message],
          updatedAt: message.createdAt
        }
      };
    }),
  setPending: (pending) => set({ pending })
}));
