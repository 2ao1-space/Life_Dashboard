"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { toDateKey } from "@/lib/constants/date";
import TransactionRow from "./transactionRow";
import TransactionFormModal from "./transactionFormModal";
import EmptyState from "@/components/shared/EmptyState";
import type { TransactionEntity } from "@/types/finance";

export default function TodayTransactionsList() {
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const [editing, setEditing] = useState<TransactionEntity | null>(null);

  const todayKey = toDateKey(new Date());
  const todayTransactions = transactions.filter(
    (t) => toDateKey(new Date(t.occurred_at)) === todayKey,
  );

  const accountName = (id: string) =>
    accounts.find((a) => a.id === id)?.name ?? "";

  return (
    <>
      <div className="rounded-card-lg border border-app-border bg-app-surface px-4 shadow-card">
        {todayTransactions.length === 0 ? (
          <EmptyState icon="🧾" title="مفيش معاملات النهاردة" />
        ) : (
          todayTransactions.map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              accountName={accountName(t.account_id)}
              onEdit={() => setEditing(t)}
            />
          ))
        )}
      </div>

      {editing && (
        <TransactionFormModal
          key={editing.id}
          isOpen
          onClose={() => setEditing(null)}
          editing={editing}
        />
      )}
    </>
  );
}
