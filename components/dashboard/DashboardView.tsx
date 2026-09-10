"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Folder,
  ListTodo,
  NotebookPen,
  WalletCards,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useFinanceSummary } from "@/hooks/useFinanceSummary";
import { useTransactions } from "@/hooks/useTransactions";
import { usePrayerDay } from "@/hooks/usePrayerDay";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useHabits } from "@/hooks/useHabits";
import { useHabitLogs } from "@/hooks/useHabitLogs";
import { useTasks } from "@/hooks/useTasks";
import { useQuranLog } from "@/hooks/useQuranLog";

const PRAYERS = [
  { key: "fajr_status", timeKey: "fajr", label: "فجر" },
  { key: "dhuhr_status", timeKey: "dhuhr", label: "ظهر" },
  { key: "asr_status", timeKey: "asr", label: "عصر" },
  { key: "maghrib_status", timeKey: "maghrib", label: "مغرب" },
  { key: "isha_status", timeKey: "isha", label: "عشاء" },
] as const;

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export default function DashboardView() {
  const router = useRouter();
  useProfile();
  const { totalBalance } = useFinanceSummary();
  const { transactions } = useTransactions();
  const { day } = usePrayerDay();
  const { data: prayerTimes, isLoading: prayerLoading } = usePrayerTimes();
  const { habits } = useHabits();
  const { isDone } = useHabitLogs(new Date());
  const { tasks, toggleTask } = useTasks();
  const { log: quranLog } = useQuranLog();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const doneHabits = habits.filter((habit) => isDone(habit.id, now)).length;
  const habitsPercent = habits.length
    ? Math.round((doneHabits / habits.length) * 100)
    : 0;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nextPrayer = prayerTimes
    ? (PRAYERS.find(
        (prayer) => toMinutes(prayerTimes[prayer.timeKey]) > currentMinutes,
      ) ?? PRAYERS[0])
    : undefined;
  const nextPrayerMinutes =
    nextPrayer && prayerTimes ? toMinutes(prayerTimes[nextPrayer.timeKey]) : 0;
  const prayerSeconds = nextPrayer
    ? (nextPrayerMinutes > currentMinutes
        ? nextPrayerMinutes - currentMinutes
        : nextPrayerMinutes + 1440 - currentMinutes) *
        60 -
      now.getSeconds()
    : 0;
  const hoursLeft = Math.floor(prayerSeconds / 3600);
  const minutesLeft = Math.floor((prayerSeconds % 3600) / 60);
  const secondsLeft = prayerSeconds % 60;
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();
  const lastMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  ).toISOString();
  const isIncome = (type: string) => type === "income" || type === "salary";
  const monthIncome = transactions
    .filter((item) => item.occurred_at >= monthStart && isIncome(item.type))
    .reduce((sum, item) => sum + item.amount, 0);
  const monthExpense = transactions
    .filter((item) => item.occurred_at >= monthStart && item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const lastNet = transactions
    .filter(
      (item) =>
        item.occurred_at >= lastMonthStart && item.occurred_at < monthStart,
    )
    .reduce(
      (sum, item) =>
        sum +
        (isIncome(item.type)
          ? item.amount
          : item.type === "expense"
            ? -item.amount
            : 0),
      0,
    );
  const change = monthIncome - monthExpense - lastNet;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-10 pt-7 sm:px-6 lg:px-10">
      <div className="grid min-w-0 gap-4 lg:grid-cols-12">
        <section
          onClick={() => router.push("/prayer")}
          className="cursor-pointer rounded-card-lg bg-app-primary p-6 text-white shadow-card lg:col-span-7 lg:p-8"
        >
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Clock3 size={18} /> الصلاة القادمة
            </p>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
              {nextPrayer?.label ?? "-"}
            </span>
          </div>
          <p className="mt-8 text-4xl font-extrabold">
            {nextPrayer && prayerTimes
              ? formatTime(prayerTimes[nextPrayer.timeKey])
              : "--:--"}
          </p>
          <p className="mt-2 text-sm opacity-80">
            {nextPrayer ? "متبقي على الصلاة" : "لا توجد مواقيت متاحة"}
          </p>
          <p className="mt-4 font-mono text-2xl font-bold tracking-wider">
            {nextPrayer
              ? `${String(hoursLeft).padStart(2, "0")}:${String(minutesLeft).padStart(2, "0")}:${String(secondsLeft).padStart(2, "0")}`
              : "--:--:--"}
          </p>
        </section>
        <section
          onClick={() => router.push("/prayer")}
          className="cursor-pointer rounded-card-lg border border-app-border bg-app-surface p-5 shadow-card lg:col-span-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-app-text">
                <Clock3 size={17} className="text-app-primary" /> مواعيد الصلاة
              </p>
              <p className="mt-1 text-xs text-app-text-2">اليوم</p>
            </div>
            {prayerLoading && (
              <span className="text-xs text-app-text-2">تحميل...</span>
            )}
          </div>
          <div className="space-y-2">
            {PRAYERS.map((prayer) => (
              <div
                key={prayer.key}
                className={`flex items-center justify-between rounded-card-sm px-3 py-2.5 ${nextPrayer?.key === prayer.key ? "bg-app-primary-soft" : "bg-app-surface-2"}`}
              >
                <span className="text-sm font-semibold text-app-text">
                  {prayer.label}
                </span>
                <span className="text-xs font-bold text-app-text-2">
                  {prayerTimes
                    ? formatTime(prayerTimes[prayer.timeKey])
                    : "--:--"}
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${day?.[prayer.key] === "done" ? "bg-app-primary" : day?.[prayer.key] === "missed" ? "bg-app-danger" : "bg-app-border"}`}
                />
              </div>
            ))}
          </div>
        </section>
        <section
          onClick={() => router.push("/finance")}
          className="cursor-pointer rounded-card-lg border border-app-border bg-app-surface p-5 shadow-card lg:col-span-12"
        >
          <div className="mb-5 flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-bold text-app-text">
                <WalletCards size={18} className="text-app-primary" /> Finance
                overview
              </p>
              <p className="mt-1 text-xs text-app-text-2">
                {now.toLocaleDateString("ar-EG", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <span
              className={`flex max-w-full items-center gap-1 rounded-full px-3 py-1 text-right text-xs font-bold ${change >= 0 ? "bg-app-primary-soft text-app-primary" : "bg-app-danger-soft text-app-danger"}`}
            >
              {change >= 0 ? (
                <ArrowDownLeft size={14} />
              ) : (
                <ArrowUpRight size={14} />
              )}
              {Math.abs(change).toLocaleString("ar-EG")} ج.م عن الشهر السابق
            </span>
          </div>
          <div className="grid min-w-0 gap-6 md:grid-cols-[1fr_1.5fr]">
            <div className="min-w-0">
              <p className="text-xs text-app-text-2">الرصيد الحالي</p>
              <p className="mt-1 text-3xl font-extrabold text-app-text">
                {totalBalance.toLocaleString("ar-EG")}{" "}
                <span className="text-sm">ج.م</span>
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-card-sm bg-app-primary-soft p-3">
                  <p className="text-[11px] text-app-text-2">دخل الشهر</p>
                  <p className="mt-1 font-bold text-app-primary">
                    +{monthIncome.toLocaleString("ar-EG")}
                  </p>
                </div>
                <div className="rounded-card-sm bg-app-danger-soft p-3">
                  <p className="text-[11px] text-app-text-2">مصروف الشهر</p>
                  <p className="mt-1 font-bold text-app-danger">
                    -{monthExpense.toLocaleString("ar-EG")}
                  </p>
                </div>
              </div>
            </div>
            <FinanceChart
              income={monthIncome}
              expense={monthExpense}
              previous={lastNet}
            />
          </div>
        </section>{" "}
        <section
          onClick={() => router.push("/habits")}
          className="cursor-pointer rounded-card-lg border border-app-border bg-app-surface p-5 shadow-card lg:col-span-4"
        >
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-bold text-app-text">
              <CheckCircle2 size={17} className="text-app-primary" /> تقدم
              العادات
            </p>
            <span className="text-2xl font-extrabold text-app-primary">
              {habitsPercent}٪
            </span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-app-surface-2">
            <div
              className="h-full rounded-full bg-app-primary"
              style={{ width: `${habitsPercent}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-app-text-2">
            أنجزت {doneHabits} من {habits.length} عادة اليوم
          </p>
        </section>{" "}
        <section
          onClick={() => router.push("/adhkar")}
          className="cursor-pointer rounded-card-lg border border-app-border bg-app-surface p-5 shadow-card lg:col-span-4"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-app-text">
            <BookOpen size={17} className="text-app-primary" /> ورد القرآن
          </p>
          <p className="mt-5 text-3xl font-extrabold text-app-text">
            {(quranLog?.pages_read ?? 0).toLocaleString("ar-EG")}{" "}
            <span className="text-sm font-semibold text-app-text-2">صفحة</span>
          </p>
          <p className="mt-2 text-xs text-app-text-2">استمر على وردك اليومي</p>
        </section>{" "}
        <section
          onClick={() => router.push("/habits")}
          className="cursor-pointer rounded-card-lg border border-app-border bg-app-surface p-5 shadow-card lg:col-span-4"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-app-text">
            <ListTodo size={17} className="text-app-primary" /> مهام اليوم
          </p>
          <p className="mt-5 text-3xl font-extrabold text-app-text">
            {tasks.filter((task) => task.done).length}
            <span className="mx-1 text-base text-app-text-2">/</span>
            {tasks.length}
          </p>
          <p className="mt-2 text-xs text-app-text-2">مهام مكتملة</p>
        </section>{" "}
        <section
          onClick={() => router.push("/habits")}
          className="cursor-pointer rounded-card-lg border border-app-border bg-app-surface p-5 shadow-card lg:col-span-7"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-bold text-app-text">
              <ListTodo size={17} className="text-app-primary" /> قائمة اليوم
            </p>
            <span className="text-xs text-app-text-2">اضغط للإنجاز</span>
          </div>
          {tasks.length ? (
            tasks.slice(0, 5).map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleTask(task.id, task.done);
                }}
                className="flex w-full items-center gap-3 border-b border-app-border py-3 text-right last:border-0"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${task.done ? "border-app-primary bg-app-primary text-white" : "border-app-border"}`}
                >
                  {task.done && <Check size={13} />}
                </span>
                <span
                  className={`min-w-0 flex-1 text-sm ${task.done ? "text-app-text-2 line-through" : "text-app-text"}`}
                >
                  {task.text}
                </span>
              </button>
            ))
          ) : (
            <p className="py-6 text-center text-xs text-app-text-2">
              لا توجد مهام اليوم
            </p>
          )}
        </section>{" "}
        <section className="rounded-card-lg border border-app-border bg-app-surface p-5 shadow-card lg:col-span-5">
          <p className="mb-4 text-sm font-bold text-app-text">الوصول السريع</p>
          <div className="grid grid-cols-2 gap-2.5">
            <QuickLink
              href="/adhkar"
              label="الأذكار"
              icon={<BookOpen size={19} />}
            />
            <QuickLink
              href="/notes"
              label="الملاحظات"
              icon={<NotebookPen size={19} />}
            />
            <QuickLink
              href="/documents"
              label="الوثائق"
              icon={<Folder size={19} />}
            />
            <QuickLink
              href="/analytics"
              label="التحليلات"
              icon={<BarChart3 size={19} />}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function FinanceChart({
  income,
  expense,
  previous,
}: {
  income: number;
  expense: number;
  previous: number;
}) {
  const max = Math.max(income, expense, Math.abs(previous), 1);
  return (
    <div className="rounded-card-md bg-app-surface-2 p-4">
      <div className="mb-3 flex justify-between text-xs text-app-text-2">
        <span>حركة الشهر</span>
        <span>مقارنة</span>
      </div>
      <div className="flex h-36 items-end justify-center gap-8 border-b border-app-border">
        <ChartBar
          label="الدخل"
          value={income}
          max={max}
          color="bg-app-primary"
        />
        <ChartBar
          label="المصروف"
          value={expense}
          max={max}
          color="bg-app-danger"
        />
        <ChartBar
          label="السابق"
          value={Math.abs(previous)}
          max={max}
          color={previous >= 0 ? "bg-app-gold" : "bg-app-danger"}
        />
      </div>
    </div>
  );
}

function ChartBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div className="flex h-full w-14 flex-col justify-end text-center">
      <div
        className={`rounded-t-md ${color}`}
        style={{ height: `${Math.max((value / max) * 100, 3)}%` }}
      />
      <span className="mt-2 text-[10px] text-app-text-2">{label}</span>
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-card-md bg-app-surface-2 p-3 text-xs font-bold text-app-text transition hover:bg-app-primary-soft hover:text-app-primary"
    >
      <span className="text-app-primary">{icon}</span>
      {label}
    </Link>
  );
}
