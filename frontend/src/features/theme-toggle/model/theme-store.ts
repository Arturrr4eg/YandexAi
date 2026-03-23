import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'avito_theme';

const detectTheme = (): ThemeMode => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

type ThemeStore = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: detectTheme(),
  setMode: mode => {
    localStorage.setItem(STORAGE_KEY, mode);
    set({ mode });
  },
  toggle: () => {
    const next = get().mode === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    set({ mode: next });
  },
}));
