"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { duasRepository } from "@/lib/repositories/duasRepository";
import type { DuaEntity } from "@/types/adhkar";

export function useDuas() {
  const { userId } = useUserId();

  const duas = useLiveQuery(async () => {
    if (!userId) return undefined;
    const all = await duasRepository.getAll(userId);
    return all.sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));
  }, [userId]);

  const addDua = (
    data: Pick<DuaEntity, "text" | "category_name" | "category_color">,
  ) => {
    if (!userId) return;
    duasRepository.create(userId, { ...data, is_pinned: false });
  };

  const updateDua = (id: string, changes: Partial<DuaEntity>) => {
    duasRepository.update(id, changes);
  };

  const togglePin = (dua: DuaEntity) => {
    duasRepository.update(dua.id, { is_pinned: !dua.is_pinned });
  };

  const removeDua = (id: string) => {
    duasRepository.remove(id);
  };

  return {
    duas: duas ?? [],
    addDua,
    updateDua,
    togglePin,
    removeDua,
    isLoading: duas === undefined,
  };
}
