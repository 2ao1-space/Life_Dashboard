"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DayReportModal from "./dayReportModal";
import { useDebts } from "@/hooks/useDebts";
import { useTransactions } from "@/hooks/useTransactions";
import { toDateKey } from "@/lib/constants/date";

const WEEKDAYS = ["أحد", "اتنين", "تلات", "أربع", "خميس", "جمعة", "سبت"];

export default function MonthCalendar() {
  const { transactions } = useTransactions();
  const { debts } = useDebts();
  const [selected, setSelected] = useState<Date | null>(null);
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const days = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(year, month, i + 1),
  );

  const dayTotals = useMemo(() => {
    const map = new Map<string, number>();

    for (const transaction of transactions) {
      const key = toDateKey(new Date(transaction.occurred_at));
      const value =
        transaction.type === "expense"
          ? -transaction.amount
          : transaction.amount;
      map.set(key, (map.get(key) ?? 0) + value);
    }

    for (const debt of debts) {
      const key = toDateKey(new Date(debt.updated_at));
      const value =
        debt.direction === "owed_by_me"
          ? debt.total_amount
          : -debt.total_amount;
      map.set(key, (map.get(key) ?? 0) + value);
    }

    return map;
  }, [debts, transactions]);

  return (
    <>
      <div
        data-no-swipe
        className="rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card"
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            aria-label="الشهر السابق"
            className="rounded-full p-2 text-app-text-2 transition hover:bg-app-surface-2"
          >
            <ChevronRight size={17} />
          </button>
          <p className="text-sm font-bold text-app-text">
            {viewDate.toLocaleDateString("ar-EG", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            aria-label="الشهر التالي"
            className="rounded-full p-2 text-app-text-2 transition hover:bg-app-surface-2"
          >
            <ChevronLeft size={17} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] text-app-text-2">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-11" />
          ))}

          {days.map((d) => {
            const key = toDateKey(d);
            const isToday = key === toDateKey(today);
            const isFuture = key > toDateKey(today);
            const total = dayTotals.get(key) ?? 0;
            const isSelected = selected && key === toDateKey(selected);

            return (
              <button
                key={key}
                type="button"
                onClick={() => !isFuture && setSelected(d)}
                disabled={isFuture}
                className={`relative flex h-11 flex-col items-center justify-center rounded-card-sm border text-[11px] font-bold transition ${
                  isSelected
                    ? "border-app-primary bg-app-primary text-white shadow-sm"
                    : isToday
                      ? "border-app-primary/40 bg-app-primary-soft text-app-primary-soft-text"
                      : isFuture
                        ? "cursor-not-allowed border-transparent bg-app-surface-2/50 text-app-text-2/35"
                        : total > 0
                          ? "border-app-primary/20 bg-app-primary-soft text-app-text"
                          : total < 0
                            ? "border-app-danger/20 bg-app-danger-soft text-app-text"
                            : "border-transparent bg-app-surface-2 text-app-text"
                }`}
              >
                <span>{d.getDate().toLocaleString("ar-EG")}</span>
                {Math.abs(total) > 0 && (
                  <span
                    className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                      total >= 0 ? "bg-app-primary" : "bg-app-danger"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <DayReportModal date={selected} onClose={() => setSelected(null)} />
    </>
  );
}
