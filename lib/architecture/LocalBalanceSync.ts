import { db } from "@/lib/architecture/db";
import type { TransactionEntity } from "@/types/finance";

async function adjustLocalBalance(
  accountId: string,
  delta: number,
): Promise<void> {
  if (delta === 0) return;
  const account = await db.accounts.get(accountId);
  if (!account) return;
  await db.accounts.update(accountId, { balance: account.balance + delta });
}

type TxEffectInput = Pick<
  TransactionEntity,
  "type" | "amount" | "account_id" | "to_account_id"
>;

export async function applyTransactionEffectLocally(
  tx: TxEffectInput,
): Promise<void> {
  if (tx.type === "income" || tx.type === "salary") {
    await adjustLocalBalance(tx.account_id, tx.amount);
  } else if (tx.type === "expense") {
    await adjustLocalBalance(tx.account_id, -tx.amount);
  } else if (tx.type === "transfer" && tx.to_account_id) {
    await adjustLocalBalance(tx.account_id, -tx.amount);
    await adjustLocalBalance(tx.to_account_id, tx.amount);
  }
}

export async function reverseTransactionEffectLocally(
  tx: TxEffectInput,
): Promise<void> {
  if (tx.type === "income" || tx.type === "salary") {
    await adjustLocalBalance(tx.account_id, -tx.amount);
  } else if (tx.type === "expense") {
    await adjustLocalBalance(tx.account_id, tx.amount);
  } else if (tx.type === "transfer" && tx.to_account_id) {
    await adjustLocalBalance(tx.account_id, tx.amount);
    await adjustLocalBalance(tx.to_account_id, -tx.amount);
  }
}
