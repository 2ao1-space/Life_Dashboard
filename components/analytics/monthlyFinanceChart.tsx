"use client";

import { useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { toDateKey } from "@/lib/constants/date";

export default function MonthlyFinanceChart() {
  const { transactions } = useTransactions();
  const today = new Date();
  const days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const points = useMemo(() => {
    let running = 0;
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth(), index + 1);
      const key = toDateKey(date);
      const delta = transactions
        .filter(
          (transaction) => toDateKey(new Date(transaction.occurred_at)) === key,
        )
        .reduce(
          (sum, transaction) =>
            sum +
            (transaction.type === "expense"
              ? -transaction.amount
              : transaction.type === "income" || transaction.type === "salary"
                ? transaction.amount
                : 0),
          0,
        );
      running += delta;
      return running;
    });
  }, [days, transactions, today.getMonth(), today.getFullYear()]);
  const max = Math.max(...points, 0);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);
  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 88 - ((point - min) / range) * 76;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-card-md bg-app-surface-2 p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-app-text-2">
        <span>صافي الحركة اليومية</span>
        <span>من أول الشهر حتى اليوم</span>
      </div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-40 w-full overflow-visible"
        role="img"
        aria-label="مخطط صافي الحركة المالية الشهرية"
      >
        <line
          x1="0"
          x2="100"
          y1="88"
          y2="88"
          stroke="var(--border)"
          strokeWidth="0.5"
        />
        <path
          d={path}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.8"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-app-text-2">
        <span>١</span>
        <span>{Math.ceil(days / 2).toLocaleString("ar-EG")}</span>
        <span>{days.toLocaleString("ar-EG")}</span>
      </div>
    </div>
  );
}
