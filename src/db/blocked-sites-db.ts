import Dexie, { Table } from "dexie";

export interface BlockedSite {
  id: string; // uuid
  url: string;
  createdAt: string;
}

export class BlockedSitesDB extends Dexie {
  blockedSites!: Table<BlockedSite, string>;

  constructor() {
    super("BlockedSitesDB");
    this.version(1).stores({
      blockedSites: "id, url, createdAt",
    });
  }
}

export const db = new BlockedSitesDB();
