import Dexie, { Table } from 'dexie';

export interface BlockedSite {
  id: string; // uuid
  url: string;
  createdAt: string;
}

export interface PauseState {
  id: string;
  startTime: string;
  duration: number; // in minutes
  isActive: boolean;
}

export class BlockedSitesDB extends Dexie {
  blockedSites!: Table<BlockedSite, string>;
  pauseState!: Table<PauseState, string>;

  constructor() {
    super('BlockedSitesDB');
    this.version(2).stores({
      blockedSites: 'id, url, createdAt',
      pauseState: 'id, startTime, duration, isActive',
    });
  }
}

export const db = new BlockedSitesDB();
