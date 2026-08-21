"use client";

import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  requireTypedConfirmation?: boolean;
  confirmWord?: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  requireTypedConfirmation = false,
  confirmWord = "حذف",
  confirmLabel = "حذف",
  isLoading = false,
}: ConfirmModalProps) {
  const [typedValue, setTypedValue] = useState("");

  const canConfirm = requireTypedConfirmation
    ? typedValue.trim() === confirmWord
    : true;

  const handleClose = () => {
    setTypedValue("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <p className="mb-4 text-sm leading-relaxed text-app-text-2">{message}</p>

      {requireTypedConfirmation && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-app-text-2">
            اكتب &quot;{confirmWord}&quot; للتأكيد
          </label>
          <input
            type="text"
            value={typedValue}
            onChange={(e) => setTypedValue(e.target.value)}
            placeholder={confirmWord}
            dir="rtl"
            className="w-full rounded-card-sm border border-app-border bg-app-bg px-3 py-2.5 text-sm text-app-text outline-none focus:border-app-primary"
          />
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
          إلغاء
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={!canConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
