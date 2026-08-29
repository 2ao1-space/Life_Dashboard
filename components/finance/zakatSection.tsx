"use client";

import { useState } from "react";
import { useZakat } from "@/hooks/useZakat";
import EntityActions from "@/components/shared/EntityActions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import EmptyState from "@/components/shared/EmptyState";
import ZakatPaymentFormModal from "./zakatPaymentFormModal";
import type { ZakatPaymentEntity } from "@/types/debtsZakat";

export default function ZakatSection() {
  const { payments, summary, removePayment } = useZakat();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<ZakatPaymentEntity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-3 rounded-card-lg bg-app-gold-soft p-4">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-app-text-2">المستحق (٢٫٥٪ من المرتبات)</span>
          <span className="font-bold text-app-text">
            {summary.totalDue.toLocaleString("ar-EG")} ج.م
          </span>
        </div>
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-app-text-2">المدفوع</span>
          <span className="font-bold text-app-primary-soft-text">
            {summary.totalPaid.toLocaleString("ar-EG")} ج.م
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-app-text-2">المتبقي المرحّل</span>
          <span className="font-bold text-app-gold">
            {summary.remaining.toLocaleString("ar-EG")} ج.م
          </span>
        </div>
      </div>

      <div className="rounded-card-lg border border-app-border bg-app-surface px-4 shadow-card">
        {payments.length === 0 ? (
          <EmptyState icon="🕌" title="مفيش دفعات زكاة مسجّلة لسه" />
        ) : (
          payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 border-b border-app-border py-3 last:border-none"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold text-app-text">
                  {p.amount.toLocaleString("ar-EG")} ج.م
                </div>
                <div className="truncate text-[11.5px] text-app-text-2">
                  {new Date(p.paid_at).toLocaleDateString("ar-EG")}
                  {p.note ? ` — ${p.note}` : ""}
                </div>
              </div>
              <EntityActions
                onEdit={() => setEditing(p)}
                onDelete={() => setDeletingId(p.id)}
              />
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="mt-2.5 w-full rounded-card-md bg-app-gold-soft py-3 text-[13.5px] font-bold text-app-gold"
      >
        ＋ تسجيل دفعة زكاة
      </button>

      {isAddOpen && (
        <ZakatPaymentFormModal
          key="add"
          isOpen
          onClose={() => setIsAddOpen(false)}
        />
      )}
      {editing && (
        <ZakatPaymentFormModal
          key={editing.id}
          isOpen
          editing={editing}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) removePayment(deletingId);
          setDeletingId(null);
        }}
        title="حذف دفعة الزكاة"
        message="هتتحذف من السجل نهائيًا."
      />
    </div>
  );
}
