"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { db } from "@/lib/architecture/db";
import { toDateKey } from "@/lib/constants/date";

export function useHabitLogs(referenceDate: Date) {
  const { userId } = useUserId();

  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthDays = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(year, month, i + 1),
  );

  const logsMap = useLiveQuery(async () => {
    if (!userId) return undefined;
    const all = await db.habit_logs.where("user_id").equals(userId).toArray();
    const map = new Map<string, boolean>();
    for (const log of all) {
      map.set(`${log.habit_id}:${log.date}`, log.done);
    }
    return map;
  }, [userId, year, month]);

  const isDone = (habitId: string, date: Date) => {
    return logsMap?.get(`${habitId}:${toDateKey(date)}`) ?? false;
  };

  return { monthDays, isDone, isLoading: logsMap === undefined };
}
