"use client";

import { useMemo } from "react";
import { useAccounts } from "./useAccounts";
import { useTransactions } from "./useTransactions";
import { toDateKey } from "@/lib/constants/date";

export function useFinanceSummary() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  );

  const { todayIncome, todayExpense } = useMemo(() => {
    const todayKey = toDateKey(new Date());
    const todayTransactions = transactions.filter(
      (t) => toDateKey(new Date(t.occurred_at)) === todayKey,
    );
    return {
      todayIncome: todayTransactions
        .filter((t) => t.type === "income" || t.type === "salary")
        .reduce((sum, t) => sum + t.amount, 0),
      todayExpense: todayTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    };
  }, [transactions]);

  return { totalBalance, todayIncome, todayExpense };
}
