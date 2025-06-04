import Dexie, { Table } from "dexie";

export interface BlockedWord {
  id: string;
  word: string;
  createdAt: string;
}

export class BlockedWordsDB extends Dexie {
  blockedWords!: Table<BlockedWord, string>;
  
  constructor() {
    super("BlockedWordsDB");
    this.version(1).stores({
      blockedWords: "id, word, createdAt",
    });
  }
}

export const db = new BlockedWordsDB();
