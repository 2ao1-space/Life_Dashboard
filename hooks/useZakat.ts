"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { db } from "@/lib/architecture/db";
import { zakatPaymentsRepository } from "@/lib/repositories/zakatPaymentsRepository";
import { useTransactions } from "./useTransactions";

const ZAKAT_RATE = 0.025;

interface AddZakatPaymentInput {
  amount: number;
  account_id: string;
  note?: string | null;
  proof_image_path?: string | null;
  paid_at?: string;
}

async function adjustLocalBalance(
  accountId: string,
  delta: number,
): Promise<void> {
  if (delta === 0) return;
  const account = await db.accounts.get(accountId);
  if (!account) return;
  await db.accounts.update(accountId, { balance: account.balance + delta });
}

export function useZakat() {
  const { userId } = useUserId();
  const { transactions } = useTransactions();

  const payments = useLiveQuery(async () => {
    if (!userId) return undefined;
    const all = await zakatPaymentsRepository.getAll(userId);
    return all.sort((a, b) => b.paid_at.localeCompare(a.paid_at));
  }, [userId]);

  const summary = useMemo(() => {
    const totalSalary = transactions
      .filter((t) => t.type === "salary")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalDue = totalSalary * ZAKAT_RATE;
    const totalPaid = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
    return {
      totalDue,
      totalPaid,
      remaining: Math.max(totalDue - totalPaid, 0),
    };
  }, [transactions, payments]);

  const addPayment = async (input: AddZakatPaymentInput) => {
    if (!userId) return;
    zakatPaymentsRepository.create(userId, {
      amount: input.amount,
      account_id: input.account_id,
      note: input.note ?? null,
      proof_image_path: input.proof_image_path ?? null,
      paid_at: input.paid_at ?? new Date().toISOString(),
    });
    await adjustLocalBalance(input.account_id, -input.amount);
  };

  const updatePayment = (
    id: string,
    changes: Partial<AddZakatPaymentInput>,
  ) => {
    zakatPaymentsRepository.update(id, changes);
  };

  const removePayment = async (id: string) => {
    const existing = await db.zakat_payments.get(id);
    if (existing)
      await adjustLocalBalance(existing.account_id, existing.amount);
    zakatPaymentsRepository.remove(id);
  };

  return {
    payments: payments ?? [],
    summary,
    addPayment,
    updatePayment,
    removePayment,
    isLoading: payments === undefined,
  };
}
