"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import Field from "@/components/shared/Field";
import Button from "@/components/shared/Button";
import { useDebts } from "@/hooks/useDebts";
import type { DebtEntity } from "@/types/debtsZakat";

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: DebtEntity;
}

export default function DebtPaymentModal({
  isOpen,
  onClose,
  debt,
}: DebtPaymentModalProps) {
  const { recordPayment } = useDebts();
  const [amount, setAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const remaining = debt.total_amount - debt.paid_amount;
  const numericAmount = parseFloat(amount);
  const isValid = numericAmount > 0 && numericAmount <= remaining;

  const handleSave = () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    recordPayment(debt.id, debt.paid_amount + numericAmount);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تسجيل سداد — ${debt.person_name}`}
      size="sm"
    >
      <p className="mb-4 text-xs text-app-text-2">
        المتبقي:{" "}
        <span className="font-bold text-app-text">
          {remaining.toLocaleString("ar-EG")}
        </span>{" "}
        من أصل {debt.total_amount.toLocaleString("ar-EG")} ج.م
      </p>
      <Field
        label="المبلغ المسدد دلوقتي"
        type="number"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
      />
      <Button onClick={handleSave} disabled={!isValid} isLoading={isSaving}>
        تسجيل السداد
      </Button>
    </Modal>
  );
}
