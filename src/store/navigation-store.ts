import { create } from 'zustand';

export type Page = 'blocked-sites' | 'blocked-words';

interface NavigationState {
  currentPage: Page;
  setPage: (page: Page) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'blocked-sites',
  setPage: (page) => set({ currentPage: page }),
}));
