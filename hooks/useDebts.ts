"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { db } from "@/lib/architecture/db";
import { debtsRepository } from "@/lib/repositories/debtsRepository";
import {
  applyDebtPaymentDeltaLocally,
  reverseDebtEffectLocally,
} from "@/lib/architecture/LocalDebtBalanceSync";
import type { DebtDirection, DebtEntity } from "@/types/debtsZakat";

interface CreateDebtInput {
  direction: DebtDirection;
  person_name: string;
  total_amount: number;
  account_id: string;
  note?: string | null;
}

export function useDebts(direction?: DebtDirection) {
  const { userId } = useUserId();

  const debts = useLiveQuery(async () => {
    if (!userId) return undefined;
    const all = await debtsRepository.getAll(userId);
    return direction ? all.filter((d) => d.direction === direction) : all;
  }, [userId, direction]);

  const addDebt = (input: CreateDebtInput) => {
    if (!userId) return;
    debtsRepository.create(userId, {
      direction: input.direction,
      person_name: input.person_name,
      total_amount: input.total_amount,
      paid_amount: 0,
      account_id: input.account_id,
      note: input.note ?? null,
    });
  };

  const updateDebtInfo = (
    id: string,
    changes: Partial<Pick<DebtEntity, "person_name" | "total_amount" | "note">>,
  ) => {
    debtsRepository.update(id, changes);
  };

  const recordPayment = async (id: string, newPaidAmount: number) => {
    const existing = await db.debts.get(id);
    if (!existing) return;
    const delta = newPaidAmount - existing.paid_amount;
    debtsRepository.update(id, {
      paid_amount: newPaidAmount,
    } as Partial<DebtEntity>);
    await applyDebtPaymentDeltaLocally(existing, delta);
  };

  const removeDebt = async (id: string) => {
    const existing = await db.debts.get(id);
    if (existing) await reverseDebtEffectLocally(existing);
    debtsRepository.remove(id);
  };

  return {
    debts: debts ?? [],
    addDebt,
    updateDebtInfo,
    recordPayment,
    removeDebt,
    isLoading: debts === undefined,
  };
}
