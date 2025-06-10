import { create } from 'zustand';
import {
  Settings,
  getSettings,
  updateSettings,
  DEFAULT_SETTINGS,
} from '@/db/settings-db';

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<void>;
  updateTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  updateCustomRedirectionUrl: (url: string) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const settings = await getSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      console.error('Error loading settings:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load settings',
        isLoading: false,
      });
    }
  },

  updateTheme: async (theme) => {
    try {
      set({ isLoading: true, error: null });
      const updatedSettings = await updateSettings({ theme });
      set({ settings: updatedSettings, isLoading: false });
    } catch (error) {
      console.error('Error updating theme:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update theme',
        isLoading: false,
      });
    }
  },

  updateCustomRedirectionUrl: async (customRedirectionUrl) => {
    try {
      set({ isLoading: true, error: null });
      const updatedSettings = await updateSettings({ customRedirectionUrl });
      set({ settings: updatedSettings, isLoading: false });
    } catch (error) {
      console.error('Error updating redirection URL:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update redirection URL',
        isLoading: false,
      });
    }
  },

  resetSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const resetSettings = await updateSettings(DEFAULT_SETTINGS);
      set({ settings: resetSettings, isLoading: false });
    } catch (error) {
      console.error('Error resetting settings:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to reset settings',
        isLoading: false,
      });
    }
  },
}));
