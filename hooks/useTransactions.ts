"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { db } from "@/lib/architecture/db";
import { transactionsRepository } from "@/lib/repositories/transactionsRepository";
import {
  applyTransactionEffectLocally,
  reverseTransactionEffectLocally,
} from "@/lib/architecture/LocalBalanceSync";
import type { TransactionEntity, TransactionType } from "@/types/finance";

interface CreateTransactionInput {
  account_id: string;
  to_account_id?: string | null;
  type: TransactionType;
  amount: number;
  reason?: string | null;
  occurred_at?: string;
}

export function useTransactions(accountId?: string) {
  const { userId } = useUserId();

  const transactions = useLiveQuery(async () => {
    if (!userId) return undefined;
    const all = await transactionsRepository.getAll(userId);
    const filtered = accountId
      ? all.filter(
          (t) => t.account_id === accountId || t.to_account_id === accountId,
        )
      : all;
    return filtered.sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
  }, [userId, accountId]);

  const addTransaction = async (input: CreateTransactionInput) => {
    if (!userId) return;
    const payload = {
      account_id: input.account_id,
      to_account_id: input.to_account_id ?? null,
      type: input.type,
      amount: input.amount,
      reason: input.reason ?? null,
      occurred_at: input.occurred_at ?? new Date().toISOString(),
    };
    transactionsRepository.create(userId, payload);
    await applyTransactionEffectLocally(payload);
  };

  const updateTransaction = async (
    id: string,
    changes: Partial<TransactionEntity>,
  ) => {
    const old = await db.transactions.get(id);
    if (old) await reverseTransactionEffectLocally(old);

    transactionsRepository.update(id, changes);

    const updated = await db.transactions.get(id);
    if (updated) await applyTransactionEffectLocally(updated);
  };

  const removeTransaction = async (id: string) => {
    const old = await db.transactions.get(id);
    if (old) await reverseTransactionEffectLocally(old);
    transactionsRepository.remove(id);
  };

  return {
    transactions: transactions ?? [],
    addTransaction,
    updateTransaction,
    removeTransaction,
    isLoading: transactions === undefined,
  };
}
