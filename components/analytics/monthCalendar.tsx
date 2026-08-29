"use client";

import { useState } from "react";
import DayReportModal from "./dayReportModal";
import { toDateKey } from "@/lib/constants/date";

const WEEKDAYS = ["أحد", "اتنين", "تلات", "أربع", "خميس", "جمعة", "سبت"];

export default function MonthCalendar() {
  const [selected, setSelected] = useState<Date | null>(null);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const days = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(year, month, i + 1),
  );

  return (
    <>
      <div className="rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] text-app-text-2">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((d) => {
            const isToday = toDateKey(d) === toDateKey(today);
            return (
              <button
                key={toDateKey(d)}
                type="button"
                onClick={() => setSelected(d)}
                className={`flex h-9 items-center justify-center rounded-card-sm text-xs font-semibold ${
                  isToday
                    ? "bg-app-primary text-white"
                    : "bg-app-surface-2 text-app-text"
                }`}
              >
                {d.getDate().toLocaleString("ar-EG")}
              </button>
            );
          })}
        </div>
      </div>

      <DayReportModal date={selected} onClose={() => setSelected(null)} />
    </>
  );
}
