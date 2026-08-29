"use client";

import { usePrayerDay } from "@/hooks/usePrayerDay";

export default function QiyamSection({ date }: { date?: Date }) {
  const { day, update } = usePrayerDay(date);
  if (!day) return null;

  return (
    <div className="rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[13.5px] font-semibold text-app-text">
          القيام{" "}
          <span className="text-xs font-normal text-app-text-2">
            — ركعتين ركعتين
          </span>
        </span>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              update({ qiyam_rakaat: Math.max(day.qiyam_rakaat - 2, 0) })
            }
            className="flex h-7 w-7 items-center justify-center rounded-full border border-app-border font-bold"
          >
            −
          </button>
          <span className="min-w-[50px] text-center text-sm font-bold text-app-text">
            {day.qiyam_rakaat.toLocaleString("ar-EG")} ركعات
          </span>
          <button
            type="button"
            onClick={() => update({ qiyam_rakaat: day.qiyam_rakaat + 2 })}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-app-border font-bold"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => update({ shafa_done: !day.shafa_done })}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
            day.shafa_done
              ? "border-app-primary bg-app-primary-soft text-app-primary-soft-text"
              : "border-app-border text-app-text-2"
          }`}
        >
          شفع (٢ ثابتة)
        </button>
        <button
          type="button"
          onClick={() => update({ witr_done: !day.witr_done })}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
            day.witr_done
              ? "border-app-primary bg-app-primary-soft text-app-primary-soft-text"
              : "border-app-border text-app-text-2"
          }`}
        >
          وتر (١ ثابتة)
        </button>
      </div>
    </div>
  );
}
