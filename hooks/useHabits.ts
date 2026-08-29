"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { habitsRepository } from "@/lib/repositories/habitsRepository";
import { habitLogsRepository } from "@/lib/repositories/habitLogsRepository";
import { toDateKey } from "@/lib/constants/date";

export function useHabits() {
  const { userId } = useUserId();

  const habits = useLiveQuery(async () => {
    if (!userId) return undefined;
    const all = await habitsRepository.getAll(userId);
    return all.sort((a, b) => a.order - b.order);
  }, [userId]);

  const addHabit = (name: string) => {
    if (!userId) return;
    habitsRepository.create(userId, { name, order: habits?.length ?? 0 });
  };

  const updateHabit = (id: string, name: string) => {
    habitsRepository.update(id, { name });
  };

  const removeHabit = (id: string) => {
    habitsRepository.remove(id);
  };

  const reorderHabits = (orderedIds: string[]) => {
    orderedIds.forEach((id, index) =>
      habitsRepository.update(id, { order: index }),
    );
  };

  const toggleDay = async (habitId: string, date: Date) => {
    if (!userId) return;
    const dateKey = toDateKey(date);
    const id = `${habitId}:${dateKey}`;
    const existing = await habitLogsRepository.getOrCreateWithId(id, userId, {
      habit_id: habitId,
      date: dateKey,
      done: false,
    });
    habitLogsRepository.update(id, { done: !existing.done });
  };

  return {
    habits: habits ?? [],
    addHabit,
    updateHabit,
    removeHabit,
    reorderHabits,
    toggleDay,
    isLoading: habits === undefined,
  };
}
