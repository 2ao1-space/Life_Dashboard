"use client";

import { useState } from "react";
import EntityActions from "@/components/shared/EntityActions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { useTransactions } from "@/hooks/useTransactions";
import type { TransactionEntity } from "@/types/finance";
import AppIcon from "@/components/shared/AppIcon";

const TYPE_STYLE: Record<string, { icon: string; className: string }> = {
  income: {
    icon: "income",
    className: "bg-app-primary-soft text-app-primary-soft-text",
  },
  salary: {
    icon: "salary",
    className: "bg-app-primary-soft text-app-primary-soft-text",
  },
  expense: { icon: "expense", className: "bg-app-danger-soft text-app-danger" },
  transfer: { icon: "transfer", className: "bg-app-gold-soft text-app-gold" },
};

interface TransactionRowProps {
  transaction: TransactionEntity;
  accountName: string;
  onEdit: () => void;
  contextAccountId?: string;
}

export default function TransactionRow({
  transaction,
  accountName,
  onEdit,
  contextAccountId,
}: TransactionRowProps) {
  const { removeTransaction } = useTransactions();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const meta = TYPE_STYLE[transaction.type];
  const time = new Date(transaction.occurred_at).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let sign: "+" | "-" | null = null;
  if (transaction.type === "income" || transaction.type === "salary")
    sign = "+";
  else if (transaction.type === "expense") sign = "-";
  else if (contextAccountId)
    sign = transaction.account_id === contextAccountId ? "-" : "+";

  const amountColor =
    sign === "+"
      ? "text-app-primary-soft-text"
      : sign === "-"
        ? "text-app-danger"
        : "text-app-gold";

  return (
    <>
      <div
        onClick={onEdit}
        className="flex cursor-pointer items-center gap-3 border-b border-app-border py-3 last:border-none"
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-card-sm ${meta.className}`}
        >
          <AppIcon name={meta.icon} size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-semibold text-app-text">
            {transaction.reason || "بدون سبب"}
          </div>
          <div className="text-[11.5px] text-app-text-2">
            {accountName} — {time}
          </div>
        </div>
        <span className={`shrink-0 text-[13.5px] font-bold ${amountColor}`}>
          {sign ?? ""}
          {transaction.amount.toLocaleString("ar-EG")}
        </span>
        <EntityActions onEdit={onEdit} onDelete={() => setIsDeleteOpen(true)} />
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          removeTransaction(transaction.id);
          setIsDeleteOpen(false);
        }}
        title="حذف المعاملة"
        message="هتتحذف نهائيًا والرصيد هيرجع زي ما كان قبلها."
      />
    </>
  );
}
