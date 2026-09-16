import { supabase } from "@/lib/supabase/client";
import { CloudAdapter } from "@/lib/architecture/CloudAdapter";
import type { ZakatPaymentEntity } from "@/types/debtsZakat";

export class ZakatCloudAdapter extends CloudAdapter<ZakatPaymentEntity> {
  constructor() {
    super("zakat_payments");
  }

  async upsert(entity: ZakatPaymentEntity): Promise<void> {
    if (!supabase) return;

    const client = supabase;
    const { data: existing, error: selectError } = await client
      .from("zakat_payments")
      .select("id")
      .eq("id", entity.id)
      .maybeSingle();
    if (selectError) throw selectError;

    if (!existing) {
      const { error } = await client.rpc("create_zakat_payment", {
        p_id: entity.id,
        p_account_id: entity.account_id,
        p_amount: entity.amount,
        p_paid_at: entity.paid_at,
        p_note: entity.note,
        p_proof_image_path: entity.proof_image_path,
      });
      if (error) throw error;
      return;
    }

    const { error } = await client
      .from("zakat_payments")
      .update({
        note: entity.note,
        proof_image_path: entity.proof_image_path,
        paid_at: entity.paid_at,
        updated_at: entity.updated_at,
      })
      .eq("id", entity.id);
    if (error) throw error;
  }

  async remove(id: string): Promise<void> {
    if (!supabase) return;

    const client = supabase;
    const { error } = await client.rpc("delete_zakat_payment", { p_id: id });
    if (error) throw error;
  }
}
