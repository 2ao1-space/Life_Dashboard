"use client";

import { useEffect, useRef, useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import { useHabitLogs } from "@/hooks/useHabitLogs";
import { useMood } from "@/hooks/useMood";
import { toDateKey } from "@/lib/constants/date";

const MOODS = ["😢", "🙁", "😐", "🙂", "😄"];

export default function HabitsGrid() {
  const today = new Date();
  const { habits, toggleDay } = useHabits();
  const { monthDays, isDone } = useHabitLogs(today);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    todayColRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [habits.length]);

  const todayKey = toDateKey(today);

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto rounded-card-lg border border-app-border bg-app-surface p-3 shadow-card"
    >
      <div className="inline-block min-w-full">
        {habits.map((habit) => (
          <div key={habit.id} className="mb-1 flex items-center gap-1">
            <span className="w-20 shrink-0 truncate text-xs font-semibold text-app-text">
              {habit.name}
            </span>
            <div className="flex gap-1">
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
                      } ${isToday ? "ring-2 ring-app-gold" : ""}`}
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
      <span className="w-20 shrink-0 text-xs font-semibold text-app-text">
        مزاج
      </span>
      <div className="flex gap-1">
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
        {mood ? MOODS[mood.mood - 1] : ""}
      </button>
      {isPickerOpen && (
        <div className="absolute bottom-full z-10 mb-1 flex gap-0.5 rounded-card-sm border border-app-border bg-app-surface p-1 shadow-card">
          {MOODS.map((emoji, i) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setMood(i + 1);
                setIsPickerOpen(false);
              }}
              className="text-sm"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
