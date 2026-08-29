"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { moodsRepository } from "@/lib/repositories/moodsRepository";
import { toDateKey } from "@/lib/constants/date";

export function useMood(date?: Date) {
  const { userId } = useUserId();
  const dateKey = toDateKey(date ?? new Date());

  const mood = useLiveQuery(async () => {
    if (!userId) return undefined;
    const all = await moodsRepository.getAll(userId);
    return all.find((m) => m.date === dateKey) ?? null;
  }, [userId, dateKey]);

  const setMood = (value: number) => {
    if (!userId) return;
    if (mood) {
      moodsRepository.update(mood.id, { mood: value });
    } else {
      moodsRepository.create(userId, { date: dateKey, mood: value });
    }
  };

  return { mood, setMood, isLoading: mood === undefined };
}
