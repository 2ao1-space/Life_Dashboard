import type { BaseEntity } from "@/lib/architecture/db";

export type DebtDirection = "owed_by_me" | "owed_to_me";

export interface DebtEntity extends BaseEntity {
  direction: DebtDirection;
  person_name: string;
  total_amount: number;
  paid_amount: number;
  account_id: string;
  note: string | null;
}

export interface ZakatPaymentEntity extends BaseEntity {
  amount: number;
  paid_at: string;
  note: string | null;
  proof_image_path: string | null;
  account_id: string;
}
