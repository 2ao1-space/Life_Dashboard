"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import Field from "@/components/shared/Field";
import Button from "@/components/shared/Button";
import { useAccounts } from "@/hooks/useAccounts";
import { useDebts } from "@/hooks/useDebts";
import type { DebtDirection, DebtEntity } from "@/types/debtsZakat";

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  direction: DebtDirection;
  editing?: DebtEntity | null;
}

export default function DebtFormModal({
  isOpen,
  onClose,
  direction,
  editing,
}: DebtFormModalProps) {
  const { accounts } = useAccounts();
  const { addDebt, updateDebtInfo } = useDebts();

  const [personName, setPersonName] = useState(editing?.person_name ?? "");
  const [totalAmount, setTotalAmount] = useState(
    editing ? String(editing.total_amount) : "",
  );
  const [accountId, setAccountId] = useState(
    editing?.account_id ?? accounts[0]?.id ?? "",
  );
  const [note, setNote] = useState(editing?.note ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const numericTotal = parseFloat(totalAmount);
  const isValid =
    Boolean(personName.trim()) && numericTotal > 0 && Boolean(accountId);
  const canEditTotal = !editing || editing.paid_amount === 0;

  const handleSave = () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);

    if (editing) {
      updateDebtInfo(editing.id, {
        person_name: personName.trim(),
        total_amount: canEditTotal ? numericTotal : editing.total_amount,
        note: note.trim() || null,
      });
    } else {
      addDebt({
        direction,
        person_name: personName.trim(),
        total_amount: numericTotal,
        account_id: accountId,
        note: note.trim() || null,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editing
          ? "تعديل البيانات"
          : direction === "owed_by_me"
            ? "دين جديد عليّا"
            : "سلفة جديدة"
      }
      size="sm"
    >
      <Field
        label={direction === "owed_by_me" ? "الدين لمين؟" : "سلّفت مين؟"}
        value={personName}
        onChange={(e) => setPersonName(e.target.value)}
        placeholder="الاسم"
      />
      <Field
        label="المبلغ الكلي"
        type="number"
        inputMode="decimal"
        value={totalAmount}
        onChange={(e) => setTotalAmount(e.target.value)}
        placeholder="0"
        disabled={!canEditTotal}
      />
      {!canEditTotal && (
        <p className="-mt-3 mb-4 text-[11px] text-app-text-2">
          متقدرش تعدّل المبلغ الكلي بعد ما يبدأ السداد
        </p>
      )}

      {!editing && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-app-text-2">
            الحساب
          </label>
          <select
            value={accountId}
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
      )}

      <Field
        label="ملاحظة (اختياري)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="أي تفاصيل إضافية"
      />

      <Button onClick={handleSave} disabled={!isValid} isLoading={isSaving}>
        حفظ
      </Button>
    </Modal>
  );
}
