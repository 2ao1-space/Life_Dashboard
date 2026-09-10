"use client";

import { useEffect, useRef, useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import { useHabitLogs } from "@/hooks/useHabitLogs";
import { useMood } from "@/hooks/useMood";
import { toDateKey } from "@/lib/constants/date";

const MOODS = [
  { key: "mood-1", icon: "😄", label: "سعيد" },
  { key: "mood-2", icon: "🙂", label: "مبسوط" },
  { key: "mood-3", icon: "😐", label: "عادي" },
  { key: "mood-4", icon: "😕", label: "مكتئب" },
  { key: "mood-5", icon: "😔", label: "حزين" },
];

export default function HabitsGrid() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const { habits, toggleDay } = useHabits();
  const { monthDays, isDone } = useHabitLogs(viewDate);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    todayColRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [habits.length]);

  const todayKey = toDateKey(today);
  const monthTitle = viewDate.toLocaleDateString("ar-EG", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      ref={scrollRef}
      data-no-swipe
      className="overflow-x-auto rounded-card-lg border border-app-border bg-app-surface p-3 shadow-card"
    >
      <div className="inline-block min-w-full">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setViewDate(
                (date) => new Date(date.getFullYear(), date.getMonth() - 1, 1),
              )
            }
            aria-label="الشهر السابق"
            className="rounded-full px-2 py-1 text-lg text-app-text-2 hover:bg-app-surface-2"
          >
            ‹
          </button>
          <span className="text-xs font-bold text-app-text">{monthTitle}</span>
          <button
            type="button"
            onClick={() =>
              setViewDate(
                (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1),
              )
            }
            aria-label="الشهر التالي"
            className="rounded-full px-2 py-1 text-lg text-app-text-2 hover:bg-app-surface-2"
          >
            ›
          </button>
        </div>
        <div className="mb-2 flex items-center gap-1 border-b border-app-border pb-2">
          <span className="sticky right-0 z-30 w-20 shrink-0 border-l border-app-border bg-app-surface px-1 text-center text-[10px] font-bold text-app-text-2 shadow-[4px_0_10px_rgba(0,0,0,0.04)]">
            الأيام
          </span>
          <div className="flex min-w-max gap-1">
            {monthDays.map((date) => {
              const isToday = toDateKey(date) === todayKey;
              return (
                <span
                  key={toDateKey(date)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[9px] ${isToday ? "bg-app-gold font-extrabold text-white" : "text-app-text-2"}`}
                >
                  {date.getDate().toLocaleString("ar-EG")}
                </span>
              );
            })}
          </div>
        </div>
        {habits.map((habit) => (
          <div key={habit.id} className="mb-1 flex items-center gap-1">
            <span className="sticky right-0 z-20 w-20 shrink-0 truncate border-l border-app-border bg-app-surface px-1 py-1 text-xs font-semibold text-app-text shadow-[4px_0_10px_rgba(0,0,0,0.04)]">
              {habit.name}
            </span>
            <div className="flex min-w-max gap-1">
              {monthDays.map((d) => {
                const key = toDateKey(d);
                const done = isDone(habit.id, d);
                const isToday = key === todayKey;
                return (
                  <div key={key} ref={isToday ? todayColRef : undefined}>
                    <button
                      type="button"
                      onClick={() => toggleDay(habit.id, d)}
                      className={`h-6 w-6 shrink-0 rounded-md ${
                        done ? "bg-app-primary" : "bg-app-surface-2"
                      } ${isToday ? "bg-app-gold ring-2 ring-app-gold ring-offset-1" : ""}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <MoodRow monthDays={monthDays} todayKey={todayKey} />
      </div>
    </div>
  );
}

function MoodRow({
  monthDays,
  todayKey,
}: {
  monthDays: Date[];
  todayKey: string;
}) {
  return (
    <div className="mt-2 flex items-center gap-1 border-t border-app-border pt-2">
      <span className="sticky right-0 z-20 w-20 shrink-0 border-l border-app-border bg-app-surface px-1 py-1 text-xs font-semibold text-app-text shadow-[4px_0_10px_rgba(0,0,0,0.04)]">
        مزاج
      </span>
      <div className="flex min-w-max gap-1">
        {monthDays.map((d) => (
          <MoodCell
            key={toDateKey(d)}
            date={d}
            isToday={toDateKey(d) === todayKey}
          />
        ))}
      </div>
    </div>
  );
}

function MoodCell({ date, isToday }: { date: Date; isToday: boolean }) {
  const { mood, setMood } = useMood(date);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsPickerOpen((v) => !v)}
        className={`flex h-6 w-6 items-center justify-center rounded-md bg-app-surface-2 text-[11px] ${
          isToday ? "ring-2 ring-app-gold" : ""
        }`}
      >
        {mood ? <span>{MOODS[mood.mood - 1].icon}</span> : null}
      </button>
      {isPickerOpen && (
        <div className="absolute bottom-full z-20 mb-2 flex items-center gap-1 rounded-card-md border border-app-border bg-app-surface p-1.5 shadow-card">
          {MOODS.map((option, i) => {
            const selected = mood?.mood === i + 1;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  setMood(i + 1);
                  setIsPickerOpen(false);
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-lg transition-all ${
                  selected
                    ? "border-app-gold bg-app-gold-soft shadow-sm"
                    : "border-transparent bg-app-surface-2 hover:border-app-border"
                }`}
                aria-label={`اختيار المزاج ${option.label}`}
                title={option.label}
              >
                {option.icon}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
