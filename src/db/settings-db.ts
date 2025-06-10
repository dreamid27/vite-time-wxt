import Dexie, { Table } from 'dexie';

export interface Settings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  customRedirectionUrl: string;
  createdAt: string;
  updatedAt: string;
}

export class SettingsDB extends Dexie {
  settings!: Table<Settings, string>;

  constructor() {
    super('SettingsDB');
    this.version(1).stores({
      settings: 'id, theme, customRedirectionUrl, createdAt, updatedAt',
    });
  }
}

export const db = new SettingsDB();

// Default settings
export const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'> = {
  theme: 'system',
  customRedirectionUrl: 'https://www.goodreads.com/quotes/tag/positive-affirmations',
};

// Helper functions
export const getSettings = async (): Promise<Settings> => {
  const settings = await db.settings.toArray();
  
  if (settings.length === 0) {
    // Create default settings if none exist
    const defaultSettings: Settings = {
      id: 'default',
      ...DEFAULT_SETTINGS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.settings.add(defaultSettings);
    return defaultSettings;
  }
  
  return settings[0];
};

export const updateSettings = async (updates: Partial<Omit<Settings, 'id' | 'createdAt'>>): Promise<Settings> => {
  const currentSettings = await getSettings();
  
  const updatedSettings: Settings = {
    ...currentSettings,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await db.settings.update('default', updatedSettings);
  return updatedSettings;
};
