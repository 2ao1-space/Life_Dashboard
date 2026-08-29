"use client";

import { useQuranLog } from "@/hooks/useQuranLog";
import { useQuranProgress } from "@/hooks/useQuranProgress";
import { TOTAL_QURAN_PAGES } from "@/types/adhkar";

export default function QuranTracker() {
  const { log, update } = useQuranLog();
  const { progress, history } = useQuranProgress();

  if (!log) return null;

  return (
    <div className="space-y-3">
      <div className="rounded-card-lg bg-app-primary p-4 text-white shadow-card">
        <div className="mb-1 flex items-center justify-between text-xs opacity-90">
          <span>
            قرأت {progress.totalPagesRead.toLocaleString("ar-EG")} صفحة
          </span>
          <span>باقي {progress.remaining.toLocaleString("ar-EG")}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <div className="mt-1.5 text-[11px] opacity-80">
          {progress.percentage}% من {TOTAL_QURAN_PAGES.toLocaleString("ar-EG")}{" "}
          صفحة
        </div>
      </div>

      <div className="rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
        <p className="mb-3 text-center text-xs font-semibold text-app-text-2">
          قراءة النهاردة
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-2">
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
              <span className="min-w-[28px] text-center text-lg font-extrabold text-app-primary">
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

          <div className="flex flex-col items-center gap-2">
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
              <span className="min-w-[28px] text-center text-lg font-extrabold text-app-primary">
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
        <div className="rounded-card-lg border border-app-border bg-app-surface px-4 shadow-card">
          <p className="py-2.5 text-xs font-bold text-app-text-2">
            سجل القراءة
          </p>
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
