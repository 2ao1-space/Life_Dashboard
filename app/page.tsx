"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useProfile } from "@/hooks/useProfile";
import { useFinanceSummary } from "@/hooks/useFinanceSummary";
import { usePrayerDay } from "@/hooks/usePrayerDay";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useHabits } from "@/hooks/useHabits";
import { useHabitLogs } from "@/hooks/useHabitLogs";
import { useTasks } from "@/hooks/useTasks";
import { useQuranLog } from "@/hooks/useQuranLog";

const FARD_ORDER = [
  { key: "fajr_status", label: "فجر", timeKey: "fajr" },
  { key: "dhuhr_status", label: "ظهر", timeKey: "dhuhr" },
  { key: "asr_status", label: "عصر", timeKey: "asr" },
  { key: "maghrib_status", label: "مغرب", timeKey: "maghrib" },
  { key: "isha_status", label: "عشاء", timeKey: "isha" },
] as const;

const PRAYER_ORDER = [
  { key: "fajr", label: "فجر" },
  { key: "dhuhr", label: "ظهر" },
  { key: "asr", label: "عصر" },
  { key: "maghrib", label: "مغرب" },
  { key: "isha", label: "عشاء" },
] as const;

type PrayerTimes = {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

function formatPrayerTime(time: string) {
  const [hoursRaw, minutesRaw] = time.split(":");

  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const period = hours >= 12 ? "م" : "ص";

  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function getMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function getNextPrayer(prayerTimes: PrayerTimes) {
  const now = new Date();

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return PRAYER_ORDER.find((prayer) => {
    const prayerMinutes = getMinutes(prayerTimes[prayer.key]);

    return prayerMinutes > currentMinutes;
  });
}

export default function DashboardPage() {
  const { profile } = useProfile();

  const { totalBalance, todayIncome, todayExpense } = useFinanceSummary();

  const { day } = usePrayerDay();

  const { data: prayerTimes, isLoading: prayerTimesLoading } = usePrayerTimes();

  const { habits } = useHabits();

  const { isDone } = useHabitLogs(new Date());

  const { tasks, toggleTask } = useTasks();

  const { log: quranLog } = useQuranLog();

  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const habitsDone = habits.filter((habit) =>
    isDone(habit.id, new Date()),
  ).length;

  const habitsPct = habits.length
    ? Math.round((habitsDone / habits.length) * 100)
    : 0;

  const nextPrayer = prayerTimes ? getNextPrayer(prayerTimes) : undefined;

  if (prayerTimesLoading) {
    return (
      <main className="mx-auto max-w-md px-4 pt-10 text-center">
        <p className="text-sm text-app-text-2">جاري تحميل مواقيت الصلاة...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md space-y-5 px-4 pb-28 pt-5">
      <div>
        <h2 className="text-lg font-extrabold text-app-text">
          أهلًا
          {profile?.name ? ` يا ${profile.name}` : ""}
        </h2>

        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs text-app-text-2">
            {currentTime.toLocaleDateString("ar-EG", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>

          <span className="text-xs text-app-text-2">•</span>

          <p className="text-xs font-semibold text-app-primary">
            {currentTime.toLocaleTimeString("ar-EG", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>
      </div>

      <div className="rounded-card-lg bg-app-primary p-5 text-white shadow-card">
        <div className="mb-1.5 text-xs opacity-85">الرصيد الكلي</div>

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

      {day && (
        <div className="rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
          {nextPrayer && prayerTimes ? (
            <p className="mb-3 text-sm font-bold text-app-text">
              الصلاة الجاية: {nextPrayer.label} —{" "}
              {formatPrayerTime(prayerTimes[nextPrayer.key])}
            </p>
          ) : (
            <p className="mb-3 text-sm font-bold text-app-text">
              انتهت صلوات اليوم
            </p>
          )}

          <div className="flex justify-between">
            {FARD_ORDER.map((prayer) => {
              const status = day[prayer.key];

              return (
                <div
                  key={prayer.key}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${
                      status === "done"
                        ? "bg-app-primary-soft text-app-primary-soft-text"
                        : status === "missed"
                          ? "bg-app-danger-soft text-app-danger"
                          : "bg-app-surface-2 text-app-text-2"
                    }`}
                  >
                    {status === "done" ? "✓" : status === "missed" ? "!" : "-"}
                  </span>

                  <span className="text-[10px] text-app-text-2">
                    {prayer.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-card-lg border border-app-border bg-app-surface p-4 text-center shadow-card">
          <div className="text-lg font-extrabold text-app-primary">
            {habitsPct.toLocaleString("ar-EG")}٪
          </div>

          <p className="mt-1 text-[11px] text-app-text-2">عادات اليوم</p>
        </div>

        <div className="rounded-card-lg border border-app-border bg-app-surface p-4 text-center shadow-card">
          <div className="text-lg font-extrabold text-app-primary">
            {(quranLog?.pages_read ?? 0).toLocaleString("ar-EG")}
          </div>

          <p className="mt-1 text-[11px] text-app-text-2">صفحات القرآن</p>
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">مهام اليوم</h2>

        <div className="rounded-card-lg border border-app-border bg-app-surface px-4 shadow-card">
          {tasks.length === 0 ? (
            <p className="py-4 text-center text-xs text-app-text-2">
              مفيش مهام النهاردة
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2.5 border-b border-app-border py-2.5 last:border-none"
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task.id, task.done)}
                  aria-label={task.done ? "إلغاء إتمام المهمة" : "إتمام المهمة"}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                    task.done
                      ? "border-app-primary bg-app-primary text-white"
                      : "border-app-border"
                  }`}
                >
                  {task.done && <span className="text-xs">✓</span>}
                </button>

                <span
                  className={`min-w-0 flex-1 break-words text-sm ${
                    task.done ? "text-app-text-2 line-through" : "text-app-text"
                  }`}
                >
                  {task.text}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">باقي الصفحات</h2>

        <div className="grid grid-cols-4 gap-2.5">
          <Link
            href="/adhkar"
            className="rounded-card-md border border-app-border bg-app-surface p-3 text-center shadow-card transition hover:-translate-y-0.5"
          >
            <div className="mb-1 text-lg">📿</div>

            <span className="text-[10.5px] font-semibold text-app-text-2">
              الأذكار
            </span>
          </Link>

          <Link
            href="/notes"
            className="rounded-card-md border border-app-border bg-app-surface p-3 text-center shadow-card transition hover:-translate-y-0.5"
          >
            <div className="mb-1 text-lg">📝</div>

            <span className="text-[10.5px] font-semibold text-app-text-2">
              الملاحظات
            </span>
          </Link>

          <Link
            href="/documents"
            className="rounded-card-md border border-app-border bg-app-surface p-3 text-center shadow-card transition hover:-translate-y-0.5"
          >
            <div className="mb-1 text-lg">📁</div>

            <span className="text-[10.5px] font-semibold text-app-text-2">
              الوثائق
            </span>
          </Link>

          <Link
            href="/analytics"
            className="rounded-card-md border border-app-border bg-app-surface p-3 text-center shadow-card transition hover:-translate-y-0.5"
          >
            <div className="mb-1 text-lg">📊</div>

            <span className="text-[10.5px] font-semibold text-app-text-2">
              التحليلات
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
