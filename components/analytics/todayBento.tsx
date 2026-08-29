"use client";

import { useFinanceSummary } from "@/hooks/useFinanceSummary";
import { usePrayerDay } from "@/hooks/usePrayerDay";
import { useHabits } from "@/hooks/useHabits";
import { useHabitLogs } from "@/hooks/useHabitLogs";

export default function TodayBento() {
  const { totalBalance } = useFinanceSummary();
  const { day } = usePrayerDay();
  const { habits } = useHabits();
  const { isDone } = useHabitLogs(new Date());

  const prayerDone = day
    ? [
        day.fajr_status,
        day.dhuhr_status,
        day.asr_status,
        day.maghrib_status,
        day.isha_status,
      ].filter((s) => s === "done").length
    : 0;
  const habitsDone = habits.filter((h) => isDone(h.id, new Date())).length;
  const habitsPct = habits.length
    ? Math.round((habitsDone / habits.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2 rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
        <p className="text-xs text-app-text-2">الرصيد الكلي</p>
        <p className="text-xl font-extrabold text-app-text">
          {totalBalance.toLocaleString("ar-EG")} ج.م
        </p>
      </div>
      <div className="rounded-card-lg border border-app-border bg-app-surface p-4 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-4 border-app-primary-soft text-xs font-bold text-app-primary">
          {prayerDone}/٥
        </div>
        <p className="mt-2 text-[11px] text-app-text-2">صلوات اليوم</p>
      </div>
      <div className="rounded-card-lg border border-app-border bg-app-surface p-4 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-4 border-app-primary-soft text-xs font-bold text-app-primary">
          {habitsPct.toLocaleString("ar-EG")}٪
        </div>
        <p className="mt-2 text-[11px] text-app-text-2">العادات</p>
      </div>
    </div>
  );
}
