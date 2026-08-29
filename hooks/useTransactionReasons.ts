"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { transactionReasonsRepository } from "@/lib/repositories/transactionReasonsRepository";

export function useTransactionReasons() {
  const { userId } = useUserId();

  const reasons = useLiveQuery(async () => {
    if (!userId) return undefined;
    return transactionReasonsRepository.getAll(userId);
  }, [userId]);

  const addReason = (text: string) => {
    if (!userId) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const alreadyExists = reasons?.some((r) => r.text === trimmed);
    if (alreadyExists) return;
    transactionReasonsRepository.create(userId, { text: trimmed });
  };

  const removeReason = (id: string) => {
    transactionReasonsRepository.remove(id);
  };

  return {
    reasons: reasons ?? [],
    addReason,
    removeReason,
    isLoading: reasons === undefined,
  };
}
