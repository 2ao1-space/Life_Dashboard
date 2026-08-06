"use client";
import { create } from "zustand";
import { getDB } from "@/lib/db";
import { PRAYER_NAMES } from "@/types";
import type { Prayer, PrayerName } from "@/types";
import { syncUpsertPrayer } from "@/lib/syncEngine";

interface PrayerState {
  prayers: Record<string, Prayer>;
  loadPrayers: (date: string) => Promise<void>;
  togglePrayer: (date: string, prayer: PrayerName) => Promise<void>;
  getCompletedCount: (date: string) => number;
  isAllComplete: (date: string) => boolean;
  hasMissedPrayers: (date: string) => boolean;
}

function emptyPrayer(date: string): Prayer {
  return {
    date,
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
    synced: false,
  };
}

export const usePrayerStore = create<PrayerState>((set, get) => ({
  prayers: {},

  loadPrayers: async (date) => {
    try {
      const record = await getDB().prayers.where("date").equals(date).first();
      set((s) => ({
        prayers: { ...s.prayers, [date]: record ?? emptyPrayer(date) },
      }));
    } catch (e) {
      console.error("loadPrayers", e);
    }
  },

  togglePrayer: async (date, prayer) => {
    const db = getDB();
    const current = get().prayers[date] ?? emptyPrayer(date);
    const newVal = !current[prayer];

    if (current.id) {
      await db.prayers.update(current.id, { [prayer]: newVal, synced: false });
      const updated = { ...current, [prayer]: newVal };
      set((s) => ({ prayers: { ...s.prayers, [date]: updated } }));
      syncUpsertPrayer(updated as Prayer & { id: number });
    } else {
      const newRecord = {
        ...emptyPrayer(date),
        [prayer]: newVal,
        synced: false,
      };
      const id = await db.prayers.add(newRecord);
      const saved = await db.prayers.get(id as number);
      if (saved) {
        set((s) => ({ prayers: { ...s.prayers, [date]: saved } }));
        syncUpsertPrayer(saved as Prayer & { id: number });
      }
    }
  },

  getCompletedCount: (date) => {
    const p = get().prayers[date];
    return p ? PRAYER_NAMES.filter((n) => p[n]).length : 0;
  },

  isAllComplete: (date) => {
    const p = get().prayers[date];
    return p ? PRAYER_NAMES.every((n) => p[n]) : false;
  },

  hasMissedPrayers: (date) => {
    const p = get().prayers[date];
    if (!p?.id) return false;
    return PRAYER_NAMES.some((n) => !p[n]);
  },
}));
