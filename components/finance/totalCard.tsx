"use client";

import { useFinanceSummary } from "@/hooks/useFinanceSummary";

export default function TotalCard() {
  const { totalBalance, todayIncome, todayExpense } = useFinanceSummary();

  return (
    <div className="rounded-card-lg bg-app-primary p-5 text-white shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs opacity-80">الرصيد الكلي</div>
          <div className="mt-1 text-3xl font-extrabold tracking-tight">
            {totalBalance.toLocaleString("ar-EG")}{" "}
            <span className="text-base font-semibold">ج.م</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <div className="rounded-card-sm bg-white/15 px-3 py-3">
          <div className="text-[11px] text-white/70">دخل النهارده</div>
          <div className="mt-1 text-sm font-bold">
            +{todayIncome.toLocaleString("ar-EG")}
          </div>
        </div>
        <div className="rounded-card-sm bg-black/10 px-3 py-3">
          <div className="text-[11px] text-white/70">مصروف النهارده</div>
          <div className="mt-1 text-sm font-bold">
            -{todayExpense.toLocaleString("ar-EG")}
          </div>
        </div>
      </div>
    </div>
  );
}
