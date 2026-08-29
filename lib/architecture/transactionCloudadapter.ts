import { supabase } from "@/lib/supabase/client";
import { CloudAdapter } from "@/lib/architecture/CloudAdapter";
import type { TransactionEntity } from "@/types/finance";

export class TransactionCloudAdapter extends CloudAdapter<TransactionEntity> {
  constructor() {
    super("transactions");
  }

  async upsert(entity: TransactionEntity): Promise<void> {
    const { data: existing, error: selectError } = await supabase
      .from("transactions")
      .select("id")
      .eq("id", entity.id)
      .maybeSingle();

    if (selectError) throw selectError;

    const rpcName = existing ? "update_transaction" : "create_transaction";
    const { error } = await supabase.rpc(rpcName, {
      p_id: entity.id,
      p_account_id: entity.account_id,
      p_to_account_id: entity.to_account_id,
      p_type: entity.type,
      p_amount: entity.amount,
      p_reason: entity.reason,
      p_occurred_at: entity.occurred_at,
    });
    if (error) throw error;
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.rpc("delete_transaction", { p_id: id });
    if (error) throw error;
  }
}
