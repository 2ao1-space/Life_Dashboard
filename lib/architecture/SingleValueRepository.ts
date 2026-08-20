import type { Table } from "dexie";
import type { BaseEntity } from "./db";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { CloudAdapter } from "./CloudAdapter";
import { SyncManager, type Syncable } from "./SyncManager";

export class SingleValueRepository<T extends BaseEntity> implements Syncable {
  private local: LocalStorageAdapter<T>;
  private cloud: CloudAdapter<T>;

  constructor(
    table: Table<T, string>,
    private tableName: string,
  ) {
    this.local = new LocalStorageAdapter<T>(table);
    this.cloud = new CloudAdapter<T>(tableName);
    SyncManager.register(this);
  }

  get(userId: string): Promise<T | undefined> {
    return this.local.getById(userId);
  }

  async save(
    userId: string,
    data: Omit<T, "id" | "user_id" | "updated_at" | "sync_status" | "deleted">,
  ): Promise<T> {
    const entity = {
      ...data,
      id: userId,
      user_id: userId,
      updated_at: new Date().toISOString(),
      sync_status: "pending",
    } as T;

    await this.local.put(entity);
    SyncManager.syncAll();
    return entity;
  }

  async syncPending(): Promise<void> {
    const pending = await this.local.getPending();
    for (const item of pending) {
      await this.cloud.upsert(item);
      await this.local.markSynced(item.id);
    }
  }
}
