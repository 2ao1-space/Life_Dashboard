"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { db } from "@/lib/architecture/db";
import { dhikrsRepository } from "@/lib/repositories/dhikrsRepository";
import type { DhikrCategory, DhikrEntity } from "@/types/adhkar";

const DEFAULT_MORNING = [
  "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
  "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوت",
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
  "أَسْتَغْفِرُ اللَّهَ",
];
const DEFAULT_EVENING = [
  "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
  "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوت",
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
  "أَسْتَغْفِرُ اللَّهَ",
];

const seedingPromises = new Map<string, Promise<void>>();

function ensureDefaultDhikrs(userId: string): Promise<void> {
  const inFlight = seedingPromises.get(userId);
  if (inFlight) return inFlight;

  const promise = db.transaction("rw", db.dhikrs, async () => {
    const count = await db.dhikrs.where("user_id").equals(userId).count();
    if (count > 0) return;
    let order = 0;
    for (const text of DEFAULT_MORNING) {
      await dhikrsRepository.create(userId, {
        category: "morning",
        text,
        target_count:
          text.includes("سُبْحَانَ") || text.includes("أَسْتَغْفِرُ") ? 100 : 1,
        current_count: 0,
        order: order++,
      });
    }
    order = 0;
    for (const text of DEFAULT_EVENING) {
      await dhikrsRepository.create(userId, {
        category: "evening",
        text,
        target_count:
          text.includes("سُبْحَانَ") || text.includes("أَسْتَغْفِرُ") ? 100 : 1,
        current_count: 0,
        order: order++,
      });
    }
  });

  seedingPromises.set(userId, promise);
  return promise;
}

export function useDhikrs(category: DhikrCategory) {
  const { userId } = useUserId();

  useEffect(() => {
    if (userId) ensureDefaultDhikrs(userId);
  }, [userId]);

  const dhikrs = useLiveQuery(async () => {
    if (!userId) return undefined;
    const all = await dhikrsRepository.getAll(userId);
    return all
      .filter((d) => d.category === category)
      .sort((a, b) => a.order - b.order);
  }, [userId, category]);

  const addDhikr = (text: string, target_count: number) => {
    if (!userId) return;
    const minOrder = Math.min(0, ...(dhikrs ?? []).map((d) => d.order));
    dhikrsRepository.create(userId, {
      category,
      text,
      target_count,
      current_count: 0,
      order: minOrder - 1,
    });
  };

  const incrementCount = (dhikr: DhikrEntity) => {
    if (dhikr.current_count >= dhikr.target_count) return;
    dhikrsRepository.update(dhikr.id, {
      current_count: dhikr.current_count + 1,
    });
  };

  const updateDhikr = (
    id: string,
    changes: Partial<Pick<DhikrEntity, "text" | "target_count">>,
  ) => {
    dhikrsRepository.update(id, changes);
  };

  const reorderDhikrs = (orderedIds: string[]) => {
    orderedIds.forEach((id, index) =>
      dhikrsRepository.update(id, { order: index }),
    );
  };

  const removeDhikr = (id: string) => {
    dhikrsRepository.remove(id);
  };

  return {
    dhikrs: dhikrs ?? [],
    addDhikr,
    incrementCount,
    updateDhikr,
    reorderDhikrs,
    removeDhikr,
    isLoading: dhikrs === undefined,
  };
}
