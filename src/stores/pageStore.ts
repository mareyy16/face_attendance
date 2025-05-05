// store/pageStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Page = {
  path?:string;
} | null;

interface PageState {
  page: Page;
  setPage: (page: Page) => void;
  clearPage: () => void;
}

export const usePageStore = create<PageState>()(
  persist(
    (set) => ({
      page: null,
      setPage: (page) => set({ page }),
      clearPage: () => set({ page: null }),
    }),
    {
      name: "page-storage",
    }
  )
);
