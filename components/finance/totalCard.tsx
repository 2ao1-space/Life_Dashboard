"use client";

import { useFinanceSummary } from "@/hooks/useFinanceSummary";

export default function TotalCard() {
  const { totalBalance, todayIncome, todayExpense } = useFinanceSummary();

  return (
    <div className="rounded-card-lg bg-app-primary p-5 text-white shadow-card">
      <div className="mb-1.5 text-xs opacity-85">إجمالي كل الحسابات</div>
      <div className="text-2xl font-extrabold">
        {totalBalance.toLocaleString("ar-EG")} ج.م
      </div>
      <div className="mt-3.5 flex gap-2.5">
        <div className="flex-1 rounded-card-sm bg-white/15 px-3 py-2.5">
          <div className="text-[11px] opacity-85">دخل اليوم</div>
          <div className="mt-0.5 text-sm font-bold">
            +{todayIncome.toLocaleString("ar-EG")}
          </div>
        </div>
        <div className="flex-1 rounded-card-sm bg-white/15 px-3 py-2.5">
          <div className="text-[11px] opacity-85">مصروف اليوم</div>
          <div className="mt-0.5 text-sm font-bold">
            -{todayExpense.toLocaleString("ar-EG")}
          </div>
        </div>
      </div>
    </div>
  );
}
