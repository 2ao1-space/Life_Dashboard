"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { db } from "@/lib/architecture/db";
import { toDateKey } from "@/lib/constants/date";

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

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

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
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((d) => {
        const isSelected = toDateKey(d) === toDateKey(selectedDate);
        return (
          <button
            key={toDateKey(d)}
            type="button"
            onClick={() => onSelect(d)}
            className={`flex h-[62px] w-12 shrink-0 flex-col items-center justify-center gap-1 rounded-card-sm text-xs font-semibold ${
              isSelected
                ? "bg-app-primary text-white"
                : "bg-app-surface-2 text-app-text-2"
            }`}
          >
            <span>{WEEKDAY_LABELS[d.getDay()]}</span>
            <span>{d.getDate().toLocaleString("ar-EG")}</span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : dotColor[statusFor(d)]}`}
            />
          </button>
        );
      })}
    </div>
  );
}
