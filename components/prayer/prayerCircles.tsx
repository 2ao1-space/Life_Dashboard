"use client";

import { usePrayerDay } from "@/hooks/usePrayerDay";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import type { FardStatus } from "@/types/prayer";

const PRAYERS: {
  key: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  label: string;
}[] = [
  { key: "fajr", label: "الفجر" },
  { key: "dhuhr", label: "الظهر" },
  { key: "asr", label: "العصر" },
  { key: "maghrib", label: "المغرب" },
  { key: "isha", label: "العشاء" },
];

const NEXT_STATUS: Record<FardStatus, FardStatus> = {
  pending: "done",
  done: "missed",
  missed: "pending",
};

const STATUS_STYLE: Record<FardStatus, string> = {
  pending: "border-app-border text-app-text-2",
  done: "border-app-primary bg-app-primary-soft text-app-primary-soft-text",
  missed: "border-app-danger bg-app-danger-soft text-app-danger",
};

const STATUS_ICON: Record<FardStatus, string> = {
  pending: "-",
  done: "✓",
  missed: "!",
};

export default function PrayerCircles({ date }: { date?: Date }) {
  const { day, update } = usePrayerDay(date);
  const { data: times } = usePrayerTimes(date);

  if (!day) return null;

  return (
    <div className="flex justify-between">
      {PRAYERS.map(({ key, label }) => {
        const statusKey = `${key}_status` as const;
        const status = day[statusKey];
        return (
          <div key={key} className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => update({ [statusKey]: NEXT_STATUS[status] })}
              className={`flex h-12 w-12 items-center justify-center rounded-full border-[3px] text-sm font-bold ${STATUS_STYLE[status]}`}
            >
              {STATUS_ICON[status]}
            </button>
            <span className="text-xs font-semibold text-app-text">{label}</span>
            {times && (
              <span className="text-[10px] text-app-text-2">{times[key]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
