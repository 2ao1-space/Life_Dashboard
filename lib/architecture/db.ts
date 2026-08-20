import Dexie, { type Table } from "dexie";

export interface BaseEntity {
  id: string;
  user_id: string;
  updated_at: string;
  sync_status: "synced" | "pending" | "error";
  deleted?: boolean;
}

export class HayatiDB extends Dexie {
  profile!: Table<import("@/types/settings").ProfileEntity, string>;
  settings!: Table<import("@/types/settings").SettingsEntity, string>;
  accounts!: Table<import("@/types/settings").AccountEntity, string>;

  constructor() {
    super("hayati-db");

    this.version(1).stores({
      _meta: "key",
    });

    this.version(2).stores({
      _meta: "key",
      profile: "id, user_id, sync_status",
      settings: "id, user_id, sync_status",
      accounts: "id, user_id, sync_status, order",
    });
  }
}

export const db = new HayatiDB();
