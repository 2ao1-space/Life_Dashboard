import { db } from "@/lib/architecture/db";
import type { DebtEntity } from "@/types/debtsZakat";

async function adjustLocalBalance(
  accountId: string,
  delta: number,
): Promise<void> {
  if (delta === 0) return;
  const account = await db.accounts.get(accountId);
  if (!account) return;
  await db.accounts.update(accountId, { balance: account.balance + delta });
}

export async function applyDebtPaymentDeltaLocally(
  debt: DebtEntity,
  delta: number,
): Promise<void> {
  if (delta === 0) return;
  if (debt.direction === "owed_by_me") {
    await adjustLocalBalance(debt.account_id, -delta);
  } else {
    await adjustLocalBalance(debt.account_id, delta);
  }
}

export async function reverseDebtEffectLocally(
  debt: DebtEntity,
): Promise<void> {
  if (debt.paid_amount === 0) return;
  if (debt.direction === "owed_by_me") {
    await adjustLocalBalance(debt.account_id, debt.paid_amount);
  } else {
    await adjustLocalBalance(debt.account_id, -debt.paid_amount);
  }
}
