"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { db } from "@/lib/architecture/db";
import { prayerRepository } from "@/lib/repositories/prayerRepository";
import { DEFAULT_PRAYER_DAY, type PrayerDayEntity } from "@/types/prayer";
import { toDateKey } from "@/lib/constants/date";

export function usePrayerDay(date?: Date) {
  const { userId } = useUserId();
  const dateKey = toDateKey(date ?? new Date());
  const id = userId ? `${userId}:${dateKey}` : null;

  useEffect(() => {
    if (!userId || !id) return;
    prayerRepository.getOrCreateWithId(id, userId, {
      ...DEFAULT_PRAYER_DAY,
      date: dateKey,
    });
  }, [userId, id, dateKey]);

  const day = useLiveQuery(async () => {
    if (!id) return undefined;
    return db.prayer_days.get(id);
  }, [id]);

  const update = (changes: Partial<PrayerDayEntity>) => {
    if (!id) return;
    prayerRepository.update(id, changes);
  };

  return { day, update, isLoading: day === undefined };
}
