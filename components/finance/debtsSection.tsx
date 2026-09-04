"use client";

import { useState } from "react";
import { useDebts } from "@/hooks/useDebts";
import EntityActions from "@/components/shared/EntityActions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import EmptyState from "@/components/shared/EmptyState";
import DebtFormModal from "./debtFormModal";
import DebtPaymentModal from "./debtPaymentModal";
import type { DebtDirection, DebtEntity } from "@/types/debtsZakat";

export default function DebtsSection() {
  const [direction, setDirection] = useState<DebtDirection>("owed_by_me");
  const { debts, removeDebt } = useDebts(direction);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<DebtEntity | null>(null);
  const [payingDebt, setPayingDebt] = useState<DebtEntity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setDirection("owed_by_me")}
          className={`flex-1 rounded-card-sm py-2 text-xs font-bold ${
            direction === "owed_by_me"
              ? "bg-app-primary text-white"
              : "bg-app-surface-2 text-app-text-2"
          }`}
        >
          عليّا ديون
        </button>
        <button
          type="button"
          onClick={() => setDirection("owed_to_me")}
          className={`flex-1 rounded-card-sm py-2 text-xs font-bold ${
            direction === "owed_to_me"
              ? "bg-app-primary text-white"
              : "bg-app-surface-2 text-app-text-2"
          }`}
        >
          أنا سلّفت
        </button>
      </div>

      <div className="rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
        {debts.length === 0 ? (
          <EmptyState
            icon="debt"
            title={
              direction === "owed_by_me" ? "مفيش ديون عليك" : "مفيش سلف لسه"
            }
          />
        ) : (
          debts.map((debt) => {
            const progress = Math.min(
              (debt.paid_amount / debt.total_amount) * 100,
              100,
            );
            const isSettled = debt.paid_amount >= debt.total_amount;
            return (
              <div
                key={debt.id}
                className="border-b border-app-border py-3 last:border-none"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => !isSettled && setPayingDebt(debt)}
                    className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-app-text"
                  >
                    {debt.person_name}
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs font-semibold text-app-text-2">
                      {debt.paid_amount.toLocaleString("ar-EG")} /{" "}
                      {debt.total_amount.toLocaleString("ar-EG")}
                    </span>
                    <EntityActions
                      onEdit={() => setEditing(debt)}
                      onDelete={() => setDeletingId(debt.id)}
                    />
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-app-surface-2">
                  <div
                    className={`h-full rounded-full ${isSettled ? "bg-app-gold" : "bg-app-primary"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {isSettled && (
                  <p className="mt-1 text-[11px] font-semibold text-app-gold">
                    اتسدد بالكامل ✓
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="mt-2.5 w-full rounded-card-md bg-app-primary-soft py-3 text-[13.5px] font-bold text-app-primary-soft-text"
      >
        ＋ {direction === "owed_by_me" ? "إضافة دين" : "إضافة سلفة"}
      </button>

      {isAddOpen && (
        <DebtFormModal
          key="add"
          isOpen
          direction={direction}
          onClose={() => setIsAddOpen(false)}
        />
      )}
      {editing && (
        <DebtFormModal
          key={editing.id}
          isOpen
          direction={direction}
          editing={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {payingDebt && (
        <DebtPaymentModal
          key={payingDebt.id}
          isOpen
          debt={payingDebt}
          onClose={() => setPayingDebt(null)}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) removeDebt(deletingId);
          setDeletingId(null);
        }}
        title="حذف السجل"
        message="هيتحذف نهائيًا، وأي سداد سابق هيتلغي أثره على رصيد الحساب المرتبط."
      />
    </div>
  );
}
