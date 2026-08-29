"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { db } from "@/lib/architecture/db";
import { PAGES_PER_QUARTER, TOTAL_QURAN_PAGES } from "@/types/adhkar";

export function useQuranProgress() {
  const { userId } = useUserId();

  const logs = useLiveQuery(async () => {
    if (!userId) return undefined;
    const all = await db.quran_logs.where("user_id").equals(userId).toArray();
    return all.sort((a, b) => b.date.localeCompare(a.date));
  }, [userId]);

  const progress = useMemo(() => {
    const totalPagesRead = (logs ?? []).reduce(
      (sum, l) =>
        sum + (l.pages_read ?? 0) + (l.quarters_read ?? 0) * PAGES_PER_QUARTER,
      0,
    );
    const remaining = Math.max(TOTAL_QURAN_PAGES - totalPagesRead, 0);
    const percentage = Math.min(
      Math.round((totalPagesRead / TOTAL_QURAN_PAGES) * 100),
      100,
    );
    return {
      totalPagesRead: Math.round(totalPagesRead),
      remaining: Math.round(remaining),
      percentage,
    };
  }, [logs]);

  const history = useMemo(
    () =>
      (logs ?? []).filter(
        (l) => (l.pages_read ?? 0) > 0 || (l.quarters_read ?? 0) > 0,
      ),
    [logs],
  );

  return { progress, history, isLoading: logs === undefined };
}
