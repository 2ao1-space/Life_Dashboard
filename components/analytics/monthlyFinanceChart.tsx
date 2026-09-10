"use client";

import { useMemo, useState } from "react";
import { useDebts } from "@/hooks/useDebts";
import { useTransactions } from "@/hooks/useTransactions";
import { toDateKey } from "@/lib/constants/date";

const REASONS_COLORS = [
  "#2F6F5E",
  "#7BAA9E",
  "#B8935F",
  "#B5654F",
  "#8C95A3",
  "#D5B98A",
  "#6E8E7B",
];

export default function MonthlyFinanceChart() {
  const { transactions } = useTransactions();
  const { debts } = useDebts();
  const [showAll, setShowAll] = useState(false);
  const today = useMemo(() => new Date(), []);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const monthSummary = useMemo(() => {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.occurred_at);
      return date >= monthStart && date <= today;
    });
    const monthDebts = debts.filter((debt) => {
      const date = new Date(debt.updated_at);
      return date >= monthStart && date <= today;
    });
    const net =
      monthTransactions
        .filter((t) => t.type === "income" || t.type === "salary")
        .reduce((sum, t) => sum + t.amount, 0) -
      monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0) +
      monthDebts
        .filter((d) => d.direction === "owed_by_me")
        .reduce((sum, debt) => sum + debt.total_amount, 0) -
      monthDebts
        .filter((d) => d.direction === "owed_to_me")
        .reduce((sum, debt) => sum + debt.total_amount, 0);

    const income =
      monthTransactions
        .filter((t) => t.type === "income" || t.type === "salary")
        .reduce((sum, t) => sum + t.amount, 0) +
      monthDebts
        .filter((d) => d.direction === "owed_by_me")
        .reduce((sum, debt) => sum + debt.total_amount, 0);

    const expense =
      monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0) +
      monthDebts
        .filter((d) => d.direction === "owed_to_me")
        .reduce((sum, debt) => sum + debt.total_amount, 0);

    const reasonMap = new Map<string, number>();
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const key = t.reason || "أخرى";
        reasonMap.set(key, (reasonMap.get(key) ?? 0) + t.amount);
      });
    monthDebts
      .filter((d) => d.direction === "owed_to_me")
      .forEach((debt) => {
        const key = `سلفة — ${debt.person_name}`;
        reasonMap.set(key, (reasonMap.get(key) ?? 0) + debt.total_amount);
      });

    const reasonBreakdown = [...reasonMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, amount], idx) => ({
        label,
        amount,
        color: REASONS_COLORS[idx % REASONS_COLORS.length],
      }));

    const incomeMap = new Map<string, number>();
    monthTransactions
      .filter((t) => t.type === "income" || t.type === "salary")
      .forEach((t) => {
        const key = t.reason || "أخرى";
        incomeMap.set(key, (incomeMap.get(key) ?? 0) + t.amount);
      });
    monthDebts
      .filter((d) => d.direction === "owed_by_me")
      .forEach((debt) => {
        const key = `دين — ${debt.person_name}`;
        incomeMap.set(key, (incomeMap.get(key) ?? 0) + debt.total_amount);
      });

    const incomeBreakdown = [...incomeMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, amount], idx) => ({
        label,
        amount,
        color: REASONS_COLORS[idx % REASONS_COLORS.length],
      }));

    const points = Array.from({ length: days }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth(), index + 1);
      const key = toDateKey(date);
      const delta = [
        ...transactions.filter(
          (transaction) => toDateKey(new Date(transaction.occurred_at)) === key,
        ),
        ...monthDebts.filter(
          (debt) => toDateKey(new Date(debt.updated_at)) === key,
        ),
      ].reduce((sum, item) => {
        if ("type" in item) {
          return (
            sum +
            (item.type === "expense"
              ? -item.amount
              : item.type === "income" || item.type === "salary"
                ? item.amount
                : 0)
          );
        }
        return (
          sum +
          (item.direction === "owed_by_me"
            ? item.total_amount
            : -item.total_amount)
        );
      }, 0);
      return delta;
    });

    let running = 0;
    const cumulativePoints = points.map((point) => {
      running += point;
      return running;
    });

    const totalValue = Math.max(...cumulativePoints, 0, income, expense);
    const max = Math.max(...cumulativePoints, 0);
    const min = Math.min(...cumulativePoints, 0);
    const range = Math.max(max - min, 1);
    const path = cumulativePoints
      .map((point, index) => {
        const x = (index / Math.max(cumulativePoints.length - 1, 1)) * 100;
        const y = 88 - ((point - min) / range) * 76;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

    return {
      income,
      expense,
      net,
      reasonBreakdown,
      incomeBreakdown,
      path,
      days,
      totalValue,
    };
  }, [days, debts, monthStart, today, transactions]);

  const monthEntries = useMemo(() => {
    const entries = [
      ...transactions
        .filter((transaction) => {
          const date = new Date(transaction.occurred_at);
          return date >= monthStart && date <= today;
        })
        .map((transaction) => ({
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
      ...debts
        .filter((debt) => {
          const date = new Date(debt.updated_at);
          return date >= monthStart && date <= today;
        })
        .map((debt) => ({
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

    return entries;
  }, [debts, monthStart, today, transactions]);

  const todayEntries = useMemo(
    () =>
      monthEntries.filter((entry) => toDateKey(entry.at) === toDateKey(today)),
    [monthEntries, today],
  );

  const todayNet = todayEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const ringCircumference = 2 * Math.PI * 42;
  const totalExpense = monthSummary.expense || 1;
  const shownTransactions = showAll ? monthEntries : monthEntries.slice(0, 5);

  return (
    <div className="space-y-4 rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-card-md bg-app-surface-2 p-3">
          <p className="text-[10px] font-bold text-app-text-2">الدخل</p>
          <p className="mt-1 text-base font-extrabold text-app-primary">
            {monthSummary.income.toLocaleString("ar-EG")}
          </p>
        </div>
        <div className="rounded-card-md bg-app-surface-2 p-3">
          <p className="text-[10px] font-bold text-app-text-2">المصروفات</p>
          <p className="mt-1 text-base font-extrabold text-app-danger">
            {monthSummary.expense.toLocaleString("ar-EG")}
          </p>
        </div>
      </div>

      <div className="rounded-card-md bg-app-surface-2 p-3">
        <p className="mb-2 text-xs font-bold text-app-text-2">تحليل الشهر</p>
        <p className="text-sm text-app-text">
          {monthSummary.net >= 0
            ? `أكملت الشهر بمكسب صافي قدره ${monthSummary.net.toLocaleString("ar-EG")} جنيه.`
            : `الشهر انتهى بصافي قدره ${Math.abs(monthSummary.net).toLocaleString("ar-EG")} جنيه خرج.`}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-card-sm bg-app-surface p-2">
            <p className="text-app-text-2">اليوم الحالي</p>
            <p
              className={`mt-1 font-bold ${todayNet >= 0 ? "text-app-primary" : "text-app-danger"}`}
            >
              {todayNet >= 0 ? "+" : "-"}
              {Math.abs(todayNet).toLocaleString("ar-EG")}
            </p>
          </div>
          <div className="rounded-card-sm bg-app-surface p-2">
            <p className="text-app-text-2">صافي الشهر</p>
            <p
              className={`mt-1 font-bold ${monthSummary.net >= 0 ? "text-app-primary" : "text-app-danger"}`}
            >
              {monthSummary.net >= 0 ? "+" : "-"}
              {Math.abs(monthSummary.net).toLocaleString("ar-EG")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-card-md bg-app-surface-2 p-3">
        <div className="mb-3 flex items-center justify-between text-xs text-app-text-2">
          <span>صافي الحركة اليومية</span>
          <span>من أول الشهر</span>
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
            d={monthSummary.path}
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
          <span>
            {Math.ceil(monthSummary.days / 2).toLocaleString("ar-EG")}
          </span>
          <span>{monthSummary.days.toLocaleString("ar-EG")}</span>
        </div>
      </div>

      <div className="rounded-card-md bg-app-surface-2 p-3">
        <div className="mb-3 flex items-center justify-between gap-2 text-xs text-app-text-2">
          <span>آخر المعاملات</span>
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="font-bold text-app-primary"
          >
            {showAll ? "إخفاء" : "عرض كل معاملات الشهر"}
          </button>
        </div>
        <div className="space-y-2">
          {shownTransactions.length === 0 ? (
            <p className="text-xs text-app-text-2">
              لا توجد معاملات في هذا الشهر.
            </p>
          ) : (
            shownTransactions.map((entry) => (
              <div
                key={`${entry.kind}-${entry.id}`}
                className="flex items-center justify-between gap-2 border-b border-app-border pb-2 last:border-none last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-app-text">
                    {entry.title}
                  </p>
                  <p className="text-[10px] text-app-text-2">
                    {entry.at.toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold ${
                    entry.amount >= 0 ? "text-app-primary" : "text-app-danger"
                  }`}
                >
                  {entry.amount >= 0 ? "+" : "-"}
                  {Math.abs(entry.amount).toLocaleString("ar-EG")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-card-md bg-app-surface-2 p-3">
        <div className="mb-3 flex items-center justify-between text-xs text-app-text-2">
          <span>تقسيم المصروفات</span>
          <span>
            {monthSummary.reasonBreakdown.length ? "بالسبب" : "لا توجد مصروفات"}
          </span>
        </div>

        {monthSummary.reasonBreakdown.length ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg
                viewBox="0 0 120 120"
                className="h-24 w-24 shrink-0"
                aria-label="دائري المصروفات"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="42"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="14"
                />
                {monthSummary.reasonBreakdown.map((item, index) => {
                  const portion = (item.amount / totalExpense) * 100;
                  const dash = (portion / 100) * ringCircumference;
                  const offset = monthSummary.reasonBreakdown
                    .slice(0, index)
                    .reduce(
                      (sum, current) =>
                        sum +
                        (current.amount / totalExpense) * ringCircumference,
                      0,
                    );
                  return (
                    <circle
                      key={item.label}
                      cx="60"
                      cy="60"
                      r="42"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="14"
                      strokeDasharray={`${dash} ${ringCircumference - dash}`}
                      strokeDashoffset={-offset}
                      transform="rotate(-90 60 60)"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
              <div className="min-w-0 flex-1 space-y-2">
                {monthSummary.reasonBreakdown.slice(0, 4).map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-[11px] text-app-text-2"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>
                    <span className="font-bold text-app-text">
                      {item.amount.toLocaleString("ar-EG")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {monthSummary.incomeBreakdown.length > 0 && (
              <div className="rounded-card-sm bg-app-surface p-2">
                <p className="mb-1 text-[10px] font-bold text-app-text-2">
                  الدخل حسب السبب
                </p>
                <div className="space-y-1">
                  {monthSummary.incomeBreakdown.slice(0, 4).map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-2 text-[11px] text-app-text-2"
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>
                      <span className="font-bold text-app-primary">
                        +{item.amount.toLocaleString("ar-EG")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-app-text-2">
            لا توجد مصروفات مسجلة لهذا الشهر حتى الآن.
          </p>
        )}
      </div>
    </div>
  );
}
