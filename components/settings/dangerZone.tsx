"use client";

import { useState } from "react";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { db } from "@/lib/architecture/db";

const CONFIRM_WORD = "حذف كل البيانات";

export default function DangerZone() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await db.transaction(
      "rw",
      [db.profile, db.settings, db.accounts],
      async () => {
        await db.profile.clear();
        await db.settings.clear();
        await db.accounts.clear();
      },
    );
    setIsDeleting(false);
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-card-md bg-app-danger-soft py-3.5 text-sm font-bold text-app-danger"
      >
        حذف كل البيانات
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="حذف كل البيانات"
        message="هيتمسح كل حاجة في التطبيق نهائيًا (معاملات، عادات، ملاحظات، كل حاجة) ومفيش رجوع فيها."
        requireTypedConfirmation
        confirmWord={CONFIRM_WORD}
        isLoading={isDeleting}
      />
    </>
  );
}
