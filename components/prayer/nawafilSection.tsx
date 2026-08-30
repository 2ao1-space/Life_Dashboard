"use client";

import { usePrayerDay } from "@/hooks/usePrayerDay";
import type { PrayerDayEntity } from "@/types/prayer";

type NafilaKey =
  | "fajr_qabliyah"
  | "dhuhr_qabliyah_1"
  | "dhuhr_qabliyah_2"
  | "dhuhr_badiyah"
  | "asr_nafilah"
  | "maghrib_badiyah"
  | "isha_badiyah";

const GROUPS: { fard: string; items: { key: NafilaKey; label: string }[] }[] = [
  { fard: "الفجر", items: [{ key: "fajr_qabliyah", label: "قبل (٢)" }] },
  {
    fard: "الظهر",
    items: [
      { key: "dhuhr_qabliyah_1", label: "قبل (٢)" },
      { key: "dhuhr_qabliyah_2", label: "قبل (٢)" },
      { key: "dhuhr_badiyah", label: "بعد (٢)" },
    ],
  },
  { fard: "العصر", items: [{ key: "asr_nafilah", label: "نافلة حرة (٢)" }] },
  { fard: "المغرب", items: [{ key: "maghrib_badiyah", label: "بعد (٢)" }] },
  { fard: "العشاء", items: [{ key: "isha_badiyah", label: "بعد (٢)" }] },
];

export default function NawafilSection({ date }: { date?: Date }) {
  const { day, update } = usePrayerDay(date);
  if (!day) return null;

  const toggle = (key: NafilaKey) => {
    update({ [key]: !day[key] } as Partial<PrayerDayEntity>);
  };

  return (
    <div className="rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
      {GROUPS.map((group) => (
        <div
          key={group.fard}
          className="border-b border-app-border py-2.5 last:border-none"
        >
          <div className="mb-2 text-[13px] font-bold text-app-text">
            {group.fard}
          </div>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => {
              const isDone = day[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggle(item.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    isDone
                      ? "border-app-primary bg-app-primary-soft text-app-primary-soft-text"
                      : "border-app-border text-app-text-2"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
