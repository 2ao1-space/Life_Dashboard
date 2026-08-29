"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { tasksRepository } from "@/lib/repositories/tasksRepository";
import { toDateKey } from "@/lib/constants/date";

export function useTasks(date?: Date) {
  const { userId } = useUserId();
  const dateKey = toDateKey(date ?? new Date());

  const tasks = useLiveQuery(async () => {
    if (!userId) return undefined;
    const all = await tasksRepository.getAll(userId);
    return all
      .filter((t) => t.date === dateKey)
      .sort((a, b) => a.order - b.order);
  }, [userId, dateKey]);

  const addTask = (text: string) => {
    if (!userId) return;
    tasksRepository.create(userId, {
      date: dateKey,
      text,
      done: false,
      order: tasks?.length ?? 0,
    });
  };

  const toggleTask = (id: string, done: boolean) => {
    tasksRepository.update(id, { done: !done });
  };

  const updateTaskText = (id: string, text: string) => {
    tasksRepository.update(id, { text });
  };

  const removeTask = (id: string) => {
    tasksRepository.remove(id);
  };

  const reorderTasks = (orderedIds: string[]) => {
    orderedIds.forEach((id, index) =>
      tasksRepository.update(id, { order: index }),
    );
  };

  return {
    tasks: tasks ?? [],
    addTask,
    toggleTask,
    updateTaskText,
    removeTask,
    reorderTasks,
    isLoading: tasks === undefined,
  };
}
