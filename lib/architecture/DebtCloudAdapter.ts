import { supabase } from "@/lib/supabase/client";
import { CloudAdapter } from "@/lib/architecture/CloudAdapter";
import type { DebtEntity } from "@/types/debtsZakat";

export class DebtCloudAdapter extends CloudAdapter<DebtEntity> {
  constructor() {
    super("debts");
  }

  async upsert(entity: DebtEntity): Promise<void> {
    const { data: existing, error: selectError } = await supabase
      .from("debts")
      .select("paid_amount")
      .eq("id", entity.id)
      .maybeSingle();
    if (selectError) throw selectError;

    if (!existing) {
      const payload: Record<string, unknown> = {
        ...entity,
      } as unknown as Record<string, unknown>;
      delete payload.sync_status;
      delete payload.deleted;
      const { error } = await supabase.from("debts").insert(payload as never);
      if (error) throw error;
      return;
    }

    if (existing.paid_amount !== entity.paid_amount) {
      const { error } = await supabase.rpc("record_debt_payment", {
        p_debt_id: entity.id,
        p_new_paid_amount: entity.paid_amount,
      });
      if (error) throw error;
    }

    const { error: updateError } = await supabase
      .from("debts")
      .update({
        person_name: entity.person_name,
        total_amount: entity.total_amount,
        note: entity.note,
        updated_at: entity.updated_at,
      })
      .eq("id", entity.id);
    if (updateError) throw updateError;
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.rpc("delete_debt", { p_debt_id: id });
    if (error) throw error;
  }
}
