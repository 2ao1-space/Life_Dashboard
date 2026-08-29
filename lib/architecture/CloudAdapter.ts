import { supabase } from "@/lib/supabase/client";
import type { BaseEntity } from "./db";

export class CloudAdapter<T extends BaseEntity> {
  constructor(private tableName: string) {}

  async upsert(entity: T): Promise<void> {
    const payload: Record<string, unknown> = { ...entity } as unknown as Record<
      string,
      unknown
    >;
    delete payload.sync_status;
    delete payload.deleted;
    const { error } = await supabase
      .from(this.tableName)
      .upsert(payload as never);
    if (error) throw error;
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq("id", id);
    if (error) throw error;
  }

  async fetchAll(userId: string): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []) as T[];
  }
}
