import type { Table } from "dexie";
import type { BaseEntity } from "./db";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { CloudAdapter } from "./CloudAdapter";
import { SyncManager, type Syncable } from "./SyncManager";

export class CollectionRepository<T extends BaseEntity> implements Syncable {
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

  getAll(userId: string): Promise<T[]> {
    return this.local.getAll(userId);
  }

  getById(id: string): Promise<T | undefined> {
    return this.local.getById(id);
  }

  async create(
    userId: string,
    data: Omit<T, "id" | "user_id" | "updated_at" | "sync_status" | "deleted">,
  ): Promise<T> {
    const entity = {
      ...data,
      id: crypto.randomUUID(),
      user_id: userId,
      updated_at: new Date().toISOString(),
      sync_status: "pending",
    } as T;

    await this.local.put(entity);
    SyncManager.syncAll();
    return entity;
  }

  async update(id: string, changes: Partial<T>): Promise<void> {
    await this.local.patch(id, {
      ...changes,
      updated_at: new Date().toISOString(),
      sync_status: "pending",
    } as Partial<T>);
    SyncManager.syncAll();
  }

  async remove(id: string): Promise<void> {
    await this.local.softDelete(id);
    SyncManager.syncAll();
  }

  async syncPending(): Promise<void> {
    const pending = await this.local.getPending();
    for (const item of pending) {
      if (item.deleted) {
        await this.cloud.remove(item.id);
        await this.local.hardDelete(item.id);
      } else {
        await this.cloud.upsert(item);
        await this.local.markSynced(item.id);
      }
    }
  }
}
