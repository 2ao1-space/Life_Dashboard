"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { db } from "@/lib/architecture/db";
import { toDateKey } from "@/lib/constants/date";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface CalendarStripProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

const WEEKDAY_LABELS = ["أحد", "اتنين", "تلات", "أربع", "خميس", "جمعة", "سبت"];

export default function CalendarStrip({
  selectedDate,
  onSelect,
}: CalendarStripProps) {
  const { userId } = useUserId();

  const [month, setMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = Array.from({ length: 42 }, (_, index) => {
    const d = new Date(
      month.getFullYear(),
      month.getMonth(),
      index - firstDay + 1,
    );
    return d;
  });

  const changeMonth = (amount: number) => {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  const records = useLiveQuery(async () => {
    if (!userId) return [];
    return db.table("prayer_days").where("user_id").equals(userId).toArray();
  }, [userId]);

  const statusFor = (date: Date) => {
    const key = toDateKey(date);
    const record = records?.find((r) => r.date === key);
    if (!record) return "none";
    const statuses = [
      record.fajr_status,
      record.dhuhr_status,
      record.asr_status,
      record.maghrib_status,
      record.isha_status,
    ];
    if (statuses.every((s) => s === "done")) return "full";
    if (statuses.some((s) => s === "missed")) return "missed";
    if (statuses.some((s) => s === "done")) return "partial";
    return "none";
  };

  const dotColor: Record<string, string> = {
    full: "bg-app-primary",
    partial: "bg-app-gold",
    missed: "bg-app-danger",
    none: "bg-app-border",
  };

  return (
    <div
      data-no-swipe
      className="rounded-card-lg border border-app-border bg-app-surface p-3 shadow-card"
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="الشهر السابق"
          className="rounded-full p-2 text-app-text-2 hover:bg-app-surface-2"
        >
          <ChevronRight size={17} />
        </button>
        <p className="text-sm font-bold text-app-text">
          {month.toLocaleDateString("ar-EG", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="الشهر التالي"
          className="rounded-full p-2 text-app-text-2 hover:bg-app-surface-2"
        >
          <ChevronLeft size={17} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="pb-2 text-[10px] font-bold text-app-text-2"
          >
            {label}
          </span>
        ))}
        {days.map((d) => {
          const isSelected = toDateKey(d) === toDateKey(selectedDate);
          const isToday = toDateKey(d) === toDateKey(new Date());
          const isCurrentMonth = d.getMonth() === month.getMonth();
          return (
            <button
              key={toDateKey(d)}
              type="button"
              onClick={() => onSelect(d)}
              className={`relative flex h-11 w-full flex-col items-center justify-center gap-0.5 rounded-card-sm text-xs font-semibold ${
                isSelected
                  ? "bg-app-primary text-white"
                  : isCurrentMonth
                    ? "text-app-text hover:bg-app-surface-2"
                    : "text-app-text-2/35"
              }`}
            >
              <span>{WEEKDAY_LABELS[d.getDay()]}</span>
              <span
                className={
                  isToday && !isSelected
                    ? "font-extrabold text-app-primary underline decoration-2 underline-offset-4"
                    : ""
                }
              >
                {d.getDate().toLocaleString("ar-EG")}
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : dotColor[statusFor(d)]}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
