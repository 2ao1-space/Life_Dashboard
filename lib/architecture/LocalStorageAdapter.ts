import type { Table, UpdateSpec } from "dexie";
import type { BaseEntity } from "./db";

export class LocalStorageAdapter<T extends BaseEntity> {
  constructor(private table: Table<T, string>) {}

  getAll(userId: string): Promise<T[]> {
    return this.table
      .where("user_id")
      .equals(userId)
      .filter((item) => !item.deleted)
      .toArray();
  }

  getById(id: string): Promise<T | undefined> {
    return this.table.get(id);
  }

  async put(entity: T): Promise<void> {
    await this.table.put(entity);
  }

  async patch(id: string, changes: Partial<T>): Promise<void> {
    await this.table.update(id, changes as UpdateSpec<T>);
  }

  async softDelete(id: string): Promise<void> {
    const changes: Partial<T> = {
      deleted: true,
      sync_status: "pending",
      updated_at: new Date().toISOString(),
    } as Partial<T>;
    await this.table.update(id, changes as UpdateSpec<T>);
  }

  async hardDelete(id: string): Promise<void> {
    await this.table.delete(id);
  }

  getPending(): Promise<T[]> {
    return this.table.where("sync_status").equals("pending").toArray();
  }

  markSynced(id: string): Promise<number> {
    return this.table.update(id, {
      sync_status: "synced",
    } as unknown as UpdateSpec<T>);
  }
}
