"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import EmptyState from "@/components/shared/EmptyState";
import TransactionRow from "./transactionRow";
import TransactionFormModal from "./transactionFormModal";
import { useTransactions } from "@/hooks/useTransactions";
import type { AccountEntity } from "@/types/settings";
import type { TransactionEntity } from "@/types/finance";

interface AccountDetailModalProps {
  account: AccountEntity | null;
  onClose: () => void;
}

export default function AccountDetailModal({
  account,
  onClose,
}: AccountDetailModalProps) {
  const { transactions } = useTransactions(account?.id);
  const [editing, setEditing] = useState<TransactionEntity | null>(null);

  return (
    <>
      <Modal
        isOpen={Boolean(account)}
        onClose={onClose}
        title={account ? `معاملات: ${account.name}` : ""}
        size="md"
      >
        {transactions.length === 0 ? (
          <EmptyState
            icon="account-card"
            title="مفيش معاملات لسه"
            description="أي معاملة تضيفها على الحساب ده هتظهر هنا"
          />
        ) : (
          <div>
            {transactions.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                accountName={account?.name ?? ""}
                contextAccountId={account?.id}
                onEdit={() => setEditing(t)}
              />
            ))}
          </div>
        )}
      </Modal>

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
