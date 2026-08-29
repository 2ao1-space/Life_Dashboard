import type { BaseEntity } from "@/lib/architecture/db";

export type TransactionType = "income" | "expense" | "transfer" | "salary";

export interface TransactionEntity extends BaseEntity {
  account_id: string;
  to_account_id: string | null;
  type: TransactionType;
  amount: number;
  reason: string | null;
  occurred_at: string;
}

export interface TransactionReasonEntity extends BaseEntity {
  text: string;
}
