"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DayReportModal from "./dayReportModal";
import { toDateKey } from "@/lib/constants/date";

const WEEKDAYS = ["أحد", "اتنين", "تلات", "أربع", "خميس", "جمعة", "سبت"];

export default function MonthCalendar() {
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
            className="rounded-full p-2 text-app-text-2 hover:bg-app-surface-2"
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
            className="rounded-full p-2 text-app-text-2 hover:bg-app-surface-2"
          >
            <ChevronLeft size={17} />
          </button>
        </div>
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
            const isFuture = toDateKey(d) > toDateKey(today);
            return (
              <button
                key={toDateKey(d)}
                type="button"
                onClick={() => !isFuture && setSelected(d)}
                disabled={isFuture}
                className={`flex h-9 items-center justify-center rounded-card-sm text-xs font-semibold ${
                  isToday
                    ? "bg-app-primary text-white"
                    : isFuture
                      ? "cursor-not-allowed bg-app-surface-2/50 text-app-text-2/35"
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
