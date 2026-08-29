"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import Field from "@/components/shared/Field";
import Button from "@/components/shared/Button";
import ReasonAutocomplete from "./reasonAutoComplete";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useTransactionReasons } from "@/hooks/useTransactionReasons";
import type { TransactionEntity, TransactionType } from "@/types/finance";

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: TransactionEntity | null;
  defaultAccountId?: string;
}

const TYPE_OPTIONS: { value: TransactionType; label: string; icon: string }[] =
  [
    { value: "income", label: "دخل", icon: "↓" },
    { value: "expense", label: "مصروف", icon: "↑" },
    { value: "transfer", label: "تحويل", icon: "↔" },
    { value: "salary", label: "مرتب", icon: "💼" },
  ];

export default function TransactionFormModal({
  isOpen,
  onClose,
  editing,
  defaultAccountId,
}: TransactionFormModalProps) {
  const { accounts } = useAccounts();
  const { addTransaction, updateTransaction } = useTransactions();
  const { addReason } = useTransactionReasons();

  const [type, setType] = useState<TransactionType>(editing?.type ?? "expense");
  const [accountId, setAccountId] = useState(
    editing?.account_id ?? defaultAccountId ?? "",
  );
  const [toAccountId, setToAccountId] = useState(editing?.to_account_id ?? "");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [reason, setReason] = useState(editing?.reason ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const effectiveAccountId = accountId || accounts[0]?.id || "";

  const numericAmount = parseFloat(amount);
  const isTransfer = type === "transfer";
  const isValid =
    Boolean(effectiveAccountId) &&
    numericAmount > 0 &&
    (!isTransfer ||
      (Boolean(toAccountId) && toAccountId !== effectiveAccountId));

  const handleSave = () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);

    if (reason.trim()) addReason(reason);

    const payload = {
      account_id: effectiveAccountId,
      to_account_id: isTransfer ? toAccountId : null,
      type,
      amount: numericAmount,
      reason: reason.trim() || null,
    };

    if (editing) {
      updateTransaction(editing.id, payload as Partial<TransactionEntity>);
    } else {
      addTransaction(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "تعديل المعاملة" : "معاملة جديدة"}
      size="sm"
    >
      <div className="mb-4 grid grid-cols-4 gap-2">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setType(opt.value)}
            className={`flex flex-col items-center gap-1 rounded-card-sm border py-2.5 text-[11px] font-semibold ${
              type === opt.value
                ? "border-app-primary bg-app-primary-soft text-app-primary-soft-text"
                : "border-app-border text-app-text-2"
            }`}
          >
            <span className="text-base">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold text-app-text-2">
          {isTransfer ? "من حساب" : "الحساب"}
        </label>
        <select
          value={effectiveAccountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="w-full rounded-card-sm border border-app-border bg-app-bg px-3 py-2.5 text-sm text-app-text outline-none focus:border-app-primary"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.icon} {a.name}
            </option>
          ))}
        </select>
      </div>

      {isTransfer && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-app-text-2">
            إلى حساب
          </label>
          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            className="w-full rounded-card-sm border border-app-border bg-app-bg px-3 py-2.5 text-sm text-app-text outline-none focus:border-app-primary"
          >
            <option value="">اختار الحساب</option>
            {accounts
              .filter((a) => a.id !== effectiveAccountId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.icon} {a.name}
                </option>
              ))}
          </select>
        </div>
      )}

      <Field
        label="المبلغ"
        type="number"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
      />

      <ReasonAutocomplete value={reason} onChange={setReason} />

      <Button onClick={handleSave} disabled={!isValid} isLoading={isSaving}>
        حفظ
      </Button>
    </Modal>
  );
}
