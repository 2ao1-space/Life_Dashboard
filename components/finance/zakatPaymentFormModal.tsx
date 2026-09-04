"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import Field from "@/components/shared/Field";
import Button from "@/components/shared/Button";
import AppIcon from "@/components/shared/AppIcon";
import { useZakat } from "@/hooks/useZakat";
import { useAccounts } from "@/hooks/useAccounts";
import type { ZakatPaymentEntity } from "@/types/debtsZakat";
import { toDateKey } from "@/lib/constants/date";

interface ZakatPaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: ZakatPaymentEntity | null;
}

export default function ZakatPaymentFormModal({
  isOpen,
  onClose,
  editing,
}: ZakatPaymentFormModalProps) {
  const { addPayment, updatePayment } = useZakat();
  const { accounts } = useAccounts();

  const [accountId, setAccountId] = useState(editing?.account_id ?? "");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [paidAt, setPaidAt] = useState(
    editing ? toDateKey(new Date(editing.paid_at)) : toDateKey(new Date()),
  );
  const [note, setNote] = useState(editing?.note ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const effectiveAccountId = accountId || accounts[0]?.id || "";
  const numericAmount = parseFloat(amount);
  const isValid = numericAmount > 0 && Boolean(effectiveAccountId);

  const handleSave = () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);

    if (editing) {
      updatePayment(editing.id, {
        note: note.trim() || null,
        paid_at: new Date(paidAt).toISOString(),
      });
    } else {
      addPayment({
        amount: numericAmount,
        account_id: effectiveAccountId,
        note: note.trim() || null,
        paid_at: new Date(paidAt).toISOString(),
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "تعديل دفعة الزكاة" : "تسجيل دفعة زكاة"}
      size="sm"
    >
      {!editing && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-app-text-2">
            هتتخصم من حساب
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
      )}

      <Field
        label="المبلغ"
        type="number"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
        disabled={Boolean(editing)}
      />
      <Field
        label="التاريخ"
        type="date"
        value={paidAt}
        onChange={(e) => setPaidAt(e.target.value)}
      />
      <Field
        label="ملاحظة (اختياري)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="مثال: زكاة راتب أغسطس"
      />
      <p className="mb-4 text-[11px] text-app-text-2">
        <AppIcon
          name="upload"
          size={14}
          className="inline-block align-text-bottom"
        />{" "}
        رفع صورة الإثبات هنضيفها في خطوة لاحقة — محتاجة إعداد Supabase Storage
        bucket الأول
      </p>
      <Button onClick={handleSave} disabled={!isValid} isLoading={isSaving}>
        حفظ
      </Button>
    </Modal>
  );
}
