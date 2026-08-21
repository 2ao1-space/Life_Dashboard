"use client";

import { useEffect, useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import { getCurrentUserId } from "@/lib/supabase/auth";

import { DEFAULT_SETTINGS, type SettingsEntity } from "@/lib/types/settings";

import { settingsRepository } from "@/lib/repositories/settingsRepository";

type SettingsInput = Omit<
  SettingsEntity,
  "id" | "user_id" | "updated_at" | "sync_status" | "deleted"
>;

export function useSettings() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUserId().then(setUserId);
  }, []);

  const settings = useLiveQuery(async () => {
    if (!userId) return undefined;

    return settingsRepository.get(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const initializeSettings = async () => {
      const existing = await settingsRepository.get(userId);

      if (!existing) {
        await settingsRepository.save(userId, DEFAULT_SETTINGS);
      }
    };

    initializeSettings();
  }, [userId]);

  const update = async (changes: Partial<SettingsInput>) => {
    if (!userId || !settings) return;

    await settingsRepository.save(userId, {
      ...settings,
      ...changes,
    });
  };

  return {
    settings,
    update,
    isLoading: settings === undefined,
  };
}

// "use client";

// import { useEffect, useState } from "react";
// import { useLiveQuery } from "dexie-react-hooks";
// import { getCurrentUserId } from "@/lib/supabase/auth";
// import { DEFAULT_SETTINGS, type SettingsEntity } from "@/types/settings";
// import { settingsRepository } from "@/lib/repositories/settingsRepository";

// type SettingsInput = Omit<
//   SettingsEntity,
//   "id" | "user_id" | "updated_at" | "sync_status" | "deleted"
// >;

// export function useSettings() {
//   const [userId, setUserId] = useState<string | null>(null);

//   useEffect(() => {
//     getCurrentUserId().then(setUserId);
//   }, []);

//   const settings = useLiveQuery(async () => {
//     if (!userId) return undefined;
//     const existing = await settingsRepository.get(userId);
//     if (existing) return existing;
//     return settingsRepository.save(userId, DEFAULT_SETTINGS);
//   }, [userId]);

//   const update = (changes: Partial<SettingsInput>) => {
//     if (!userId || !settings) return;
//     settingsRepository.save(userId, { ...settings, ...changes });
//   };

//   return { settings, update, isLoading: settings === undefined };
// }
