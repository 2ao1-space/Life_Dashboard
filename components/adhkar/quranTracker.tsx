"use client";

import { useQuranLog } from "@/hooks/useQuranLog";
import { useQuranProgress } from "@/hooks/useQuranProgress";
import { TOTAL_QURAN_PAGES } from "@/types/adhkar";

export default function QuranTracker() {
  const { log, update } = useQuranLog();
  const { progress, history } = useQuranProgress();

  if (!log) return null;

  return (
    <div className="overflow-hidden rounded-card-lg border border-app-border bg-app-surface shadow-card">
      <div className="bg-app-primary p-4 text-white">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-white/70">إجمالي قراءتك</p>
            <p className="mt-1 text-2xl font-extrabold">
              {progress.totalPagesRead.toLocaleString("ar-EG")}{" "}
              <span className="text-sm font-semibold">صفحة</span>
            </p>
          </div>
          <p className="text-xs text-white/75">{progress.percentage}%</p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
          />
        </div>
        <div className="mt-2 text-[11px] text-white/70">
          {progress.percentage}% من {TOTAL_QURAN_PAGES.toLocaleString("ar-EG")}{" "}
          صفحة
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-extrabold text-app-text">قراءة النهاردة</p>
          <p className="text-[11px] text-app-text-2">سجّل إنجازك</p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-app-border">
          <div className="pl-3">
            <span className="text-[11px] text-app-text-2">صفحات</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  update({ pages_read: Math.max((log.pages_read ?? 0) - 1, 0) })
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-app-border font-bold text-app-text-2"
              >
                −
              </button>
              <span className="min-w-7 text-center text-lg font-extrabold text-app-primary">
                {(log.pages_read ?? 0).toLocaleString("ar-EG")}
              </span>
              <button
                type="button"
                onClick={() =>
                  update({ pages_read: (log.pages_read ?? 0) + 1 })
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-app-border font-bold text-app-text-2"
              >
                +
              </button>
            </div>
          </div>

          <div className="pr-3">
            <span className="text-[11px] text-app-text-2">أرباع</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  update({
                    quarters_read: Math.max((log.quarters_read ?? 0) - 1, 0),
                  })
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-app-border font-bold text-app-text-2"
              >
                −
              </button>
              <span className="min-w-7 text-center text-lg font-extrabold text-app-primary">
                {(log.quarters_read ?? 0).toLocaleString("ar-EG")}
              </span>
              <button
                type="button"
                onClick={() =>
                  update({ quarters_read: (log.quarters_read ?? 0) + 1 })
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-app-border font-bold text-app-text-2"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {history.length > 1 && (
        <div className="border-t border-app-border px-4">
          <p className="py-3 text-xs font-bold text-app-text-2">سجل القراءة</p>
          {history.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between border-t border-app-border py-2.5"
            >
              <span className="text-xs text-app-text-2">
                {new Date(h.date).toLocaleDateString("ar-EG", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span className="text-xs font-semibold text-app-text">
                {(h.pages_read ?? 0) > 0 &&
                  `${(h.pages_read ?? 0).toLocaleString("ar-EG")} صفحة`}
                {(h.pages_read ?? 0) > 0 && (h.quarters_read ?? 0) > 0 && " + "}
                {(h.quarters_read ?? 0) > 0 &&
                  `${(h.quarters_read ?? 0).toLocaleString("ar-EG")} ربع`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
