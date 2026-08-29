import { supabase } from "@/lib/supabase/client";
import { CloudAdapter } from "@/lib/architecture/CloudAdapter";
import type { AccountEntity } from "@/types/settings";

export class AccountCloudAdapter extends CloudAdapter<AccountEntity> {
  constructor() {
    super("accounts");
  }

  async upsert(entity: AccountEntity): Promise<void> {
    const { data: existing, error: selectError } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", entity.id)
      .maybeSingle();
    if (selectError) throw selectError;

    if (!existing) {
      const payload: Record<string, unknown> = {
        ...entity,
      } as unknown as Record<string, unknown>;
      delete payload.sync_status;
      delete payload.deleted;
      delete payload.balance;
      const { error } = await supabase
        .from("accounts")
        .insert(payload as never);
      if (error) throw error;
      return;
    }

    const { error } = await supabase
      .from("accounts")
      .update({
        name: entity.name,
        icon: entity.icon,
        order: entity.order,
        updated_at: entity.updated_at,
      })
      .eq("id", entity.id);
    if (error) throw error;
  }
}
