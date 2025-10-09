import { create } from "zustand";
import type { Message } from "./types/types";

interface ChatState {
  messages: Message[];
  loading: boolean;
  addMessage: (msg: Message) => void;
  setLoading: (val: boolean) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  loading: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (val) => set({ loading: val }),
  resetChat: () => set({ messages: [] }),
}));
