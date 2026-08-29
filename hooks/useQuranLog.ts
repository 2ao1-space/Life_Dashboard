"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { db } from "@/lib/architecture/db";
import { quranLogsRepository } from "@/lib/repositories/quranLogsRepository";
import { toDateKey } from "@/lib/constants/date";
import type { QuranLogEntity } from "@/types/adhkar";

const DEFAULTS: Omit<
  QuranLogEntity,
  "id" | "user_id" | "updated_at" | "sync_status" | "deleted" | "date"
> = {
  pages_read: 0,
  quarters_read: 0,
  note: null,
};

export function useQuranLog(date?: Date) {
  const { userId } = useUserId();
  const dateKey = toDateKey(date ?? new Date());
  const id = userId ? `${userId}:${dateKey}` : null;

  useEffect(() => {
    if (!userId || !id) return;
    quranLogsRepository.getOrCreateWithId(id, userId, {
      ...DEFAULTS,
      date: dateKey,
    });
  }, [userId, id, dateKey]);

  const log = useLiveQuery(async () => {
    if (!id) return undefined;
    return db.quran_logs.get(id);
  }, [id]);

  const update = (changes: Partial<QuranLogEntity>) => {
    if (!id) return;
    quranLogsRepository.update(id, changes);
  };

  return { log, update, isLoading: log === undefined };
}
