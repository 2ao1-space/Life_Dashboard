"use client";

import Modal from "@/components/shared/Modal";
import { useTransactions } from "@/hooks/useTransactions";
import { useDebts } from "@/hooks/useDebts";
import { usePrayerDay } from "@/hooks/usePrayerDay";
import { useHabits } from "@/hooks/useHabits";
import { useHabitLogs } from "@/hooks/useHabitLogs";
import { useTasks } from "@/hooks/useTasks";
import { useQuranLog } from "@/hooks/useQuranLog";
import { useMood } from "@/hooks/useMood";
import { toDateKey } from "@/lib/constants/date";
import type { FardStatus } from "@/types/prayer";
import AppIcon from "@/components/shared/AppIcon";

interface DayReportModalProps {
  date: Date | null;
  onClose: () => void;
}

const FARD_KEYS = [
  "fajr_status",
  "dhuhr_status",
  "asr_status",
  "maghrib_status",
  "isha_status",
] as const;
const FARD_LABELS: Record<(typeof FARD_KEYS)[number], string> = {
  fajr_status: "فجر",
  dhuhr_status: "ظهر",
  asr_status: "عصر",
  maghrib_status: "مغرب",
  isha_status: "عشاء",
};
const MOODS = ["mood-1", "mood-2", "mood-3", "mood-4", "mood-5"];

export default function DayReportModal({ date, onClose }: DayReportModalProps) {
  const safeDate = date ?? new Date();
  const dateKey = toDateKey(safeDate);

  const { transactions } = useTransactions();
  const { debts } = useDebts();
  const { day: prayerDay, update: updatePrayer } = usePrayerDay(safeDate);
  const { habits } = useHabits();
  const { isDone } = useHabitLogs(safeDate);
  const { tasks } = useTasks(safeDate);
  const { log: quranLog } = useQuranLog(safeDate);
  const { mood } = useMood(safeDate);

  const dayTransactions = transactions.filter(
    (t) => toDateKey(new Date(t.occurred_at)) === dateKey,
  );
  const dayDebts = debts.filter(
    (debt) => toDateKey(new Date(debt.updated_at)) === dateKey,
  );

  const income =
    dayTransactions
      .filter((t) => t.type === "income" || t.type === "salary")
      .reduce((sum, t) => sum + t.amount, 0) +
    dayDebts
      .filter((debt) => debt.direction === "owed_by_me")
      .reduce((sum, debt) => sum + debt.total_amount, 0);

  const expense =
    dayTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0) +
    dayDebts
      .filter((debt) => debt.direction === "owed_to_me")
      .reduce((sum, debt) => sum + debt.total_amount, 0);

  const net = income - expense;

  const expenseBreakdown = Array.from(
    dayTransactions
      .filter((t) => t.type === "expense")
      .reduce((map, t) => {
        const key = t.reason || "أخرى";
        map.set(key, (map.get(key) ?? 0) + t.amount);
        return map;
      }, new Map<string, number>())
      .entries(),
  ).sort((a, b) => b[1] - a[1]);

  const incomeBreakdown = Array.from(
    dayTransactions
      .filter((t) => t.type === "income" || t.type === "salary")
      .reduce((map, t) => {
        const key = t.reason || "أخرى";
        map.set(key, (map.get(key) ?? 0) + t.amount);
        return map;
      }, new Map<string, number>())
      .entries(),
  ).sort((a, b) => b[1] - a[1]);

  const dayEntries = [
    ...dayTransactions.map((transaction) => ({
      id: transaction.id,
      kind: "transaction" as const,
      title: transaction.reason || "معاملة",
      amount:
        transaction.type === "expense"
          ? -transaction.amount
          : transaction.amount,
      type: transaction.type === "expense" ? "expense" : "income",
      at: new Date(transaction.occurred_at),
    })),
    ...dayDebts.map((debt) => ({
      id: debt.id,
      kind: "debt" as const,
      title:
        debt.direction === "owed_by_me"
          ? `دين عليّ — ${debt.person_name}`
          : `سلفة — ${debt.person_name}`,
      amount:
        debt.direction === "owed_by_me"
          ? debt.total_amount
          : -debt.total_amount,
      type: debt.direction === "owed_by_me" ? "income" : "expense",
      at: new Date(debt.updated_at),
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  const cyclePrayerFix = (key: (typeof FARD_KEYS)[number]) => {
    const current = prayerDay?.[key];
    const next: FardStatus =
      current === "missed" ? "done" : current === "done" ? "pending" : "missed";
    updatePrayer({ [key]: next });
  };

  return (
    <Modal
      isOpen={Boolean(date)}
      onClose={onClose}
      title={safeDate.toLocaleDateString("ar-EG", {
        day: "numeric",
        month: "long",
      })}
      size="lg"
    >
      <div className="space-y-4">
        <div className="rounded-[24px] border border-app-border bg-gradient-to-br from-app-surface-2 via-app-surface to-app-surface-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-app-text-2 uppercase">
                receipt
              </p>
              <h3 className="mt-1 text-lg font-black text-app-text">
                إيصال اليوم
              </h3>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                net >= 0
                  ? "bg-app-primary-soft text-app-primary-soft-text"
                  : "bg-app-danger-soft text-app-danger"
              }`}
            >
              {net >= 0 ? "مكسب" : "مصروف"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-card-sm bg-app-surface p-2.5">
              <p className="text-[10px] font-bold text-app-text-2">الدخل</p>
              <p className="mt-1 font-black text-app-primary">
                +{income.toLocaleString("ar-EG")}
              </p>
            </div>
            <div className="rounded-card-sm bg-app-surface p-2.5">
              <p className="text-[10px] font-bold text-app-text-2">المصروف</p>
              <p className="mt-1 font-black text-app-danger">
                -{expense.toLocaleString("ar-EG")}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-app-border pt-3 text-sm">
            <span className="text-app-text-2">صافي اليوم</span>
            <span
              className={`font-black ${net >= 0 ? "text-app-primary" : "text-app-danger"}`}
            >
              {net >= 0 ? "+" : "-"}
              {Math.abs(net).toLocaleString("ar-EG")}
            </span>
          </div>
        </div>

        <div className="rounded-[24px] border border-app-border bg-app-surface-2 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold text-app-text-2">
              تفاصيل المعاملات
            </p>
            <span className="rounded-full bg-app-surface px-2 py-1 text-[10px] font-bold text-app-text-2">
              {dayEntries.length} عنصر
            </span>
          </div>

          {dayEntries.length === 0 ? (
            <p className="text-sm text-app-text-2">
              لا توجد معاملات في هذا اليوم
            </p>
          ) : (
            <div className="space-y-2">
              {dayEntries.map((entry) => (
                <div
                  key={`${entry.kind}-${entry.id}`}
                  className="flex items-center justify-between gap-3 rounded-card-sm border border-app-border bg-app-surface px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-app-text">
                      {entry.title}
                    </p>
                    <p className="text-[10px] text-app-text-2">
                      {entry.at.toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-black ${
                      entry.amount >= 0 ? "text-app-primary" : "text-app-danger"
                    }`}
                  >
                    {entry.amount >= 0 ? "+" : "-"}
                    {Math.abs(entry.amount).toLocaleString("ar-EG")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {(expenseBreakdown.length > 0 || incomeBreakdown.length > 0) && (
          <div className="rounded-[24px] border border-app-border bg-app-surface-2 p-4">
            <div className="space-y-3">
              {incomeBreakdown.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-bold text-app-primary">
                    الدخل
                  </p>
                  <div className="space-y-1.5">
                    {incomeBreakdown.map(([label, amount]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-2 text-xs text-app-text"
                      >
                        <span className="min-w-0 flex-1 truncate">{label}</span>
                        <span className="font-bold text-app-primary">
                          +{amount.toLocaleString("ar-EG")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expenseBreakdown.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-bold text-app-danger">
                    المصروفات
                  </p>
                  <div className="space-y-1.5">
                    {expenseBreakdown.map(([label, amount]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-2 text-xs text-app-text"
                      >
                        <span className="min-w-0 flex-1 truncate">{label}</span>
                        <span className="font-bold text-app-danger">
                          -{amount.toLocaleString("ar-EG")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {prayerDay && (
          <div className="rounded-card-md bg-app-surface-2 p-3">
            <p className="mb-2 text-xs font-bold text-app-text-2">
              الصلاة — دوس على أي فرض لتصحيحه
            </p>
            <div className="flex justify-between">
              {FARD_KEYS.map((key) => {
                const status = prayerDay[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => cyclePrayerFix(key)}
                    className={`flex h-9 w-9 flex-col items-center justify-center rounded-full text-[9px] font-bold ${
                      status === "done"
                        ? "bg-app-primary-soft text-app-primary-soft-text"
                        : status === "missed"
                          ? "bg-app-danger-soft text-app-danger"
                          : "bg-app-border text-app-text-2"
                    }`}
                  >
                    {status === "done" ? (
                      <AppIcon name="✅" size={13} />
                    ) : status === "missed" ? (
                      "!"
                    ) : (
                      "-"
                    )}
                    <span>{FARD_LABELS[key]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {habits.length > 0 && (
          <div className="rounded-card-md bg-app-surface-2 p-3">
            <p className="mb-2 text-xs font-bold text-app-text-2">العادات</p>
            {habits.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between py-1 text-sm text-app-text"
              >
                <span>{h.name}</span>
                <span>
                  {isDone(h.id, safeDate) ? (
                    <AppIcon name="✅" size={14} />
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {tasks.length > 0 && (
          <div className="rounded-card-md bg-app-surface-2 p-3">
            <p className="mb-2 text-xs font-bold text-app-text-2">المهام</p>
            {tasks.map((t) => (
              <p
                key={t.id}
                className={`text-sm ${t.done ? "text-app-text-2 line-through" : "text-app-text"}`}
              >
                {t.text}
              </p>
            ))}
          </div>
        )}

        {quranLog && quranLog.pages_read > 0 && (
          <div className="rounded-card-md bg-app-surface-2 p-3">
            <p className="mb-1 text-xs font-bold text-app-text-2">القرآن</p>
            <p className="text-sm text-app-text">
              {quranLog.pages_read.toLocaleString("ar-EG")} صفحة
            </p>
          </div>
        )}

        {mood && (
          <div className="rounded-card-md bg-app-surface-2 p-3">
            <p className="mb-1 text-xs font-bold text-app-text-2">المزاج</p>
            <AppIcon name={MOODS[mood.mood - 1]} size={22} />
          </div>
        )}
      </div>
    </Modal>
  );
}
