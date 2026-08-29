"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { settingsRepository } from "@/lib/repositories/settingsRepository";
import { DEFAULT_SETTINGS, type SettingsEntity } from "@/types/settings";

type SettingsInput = Omit<
  SettingsEntity,
  "id" | "user_id" | "updated_at" | "sync_status" | "deleted"
>;

export function useSettings() {
  const { userId } = useUserId();

  useEffect(() => {
    if (!userId) return;
    settingsRepository.get(userId).then((existing) => {
      if (!existing) settingsRepository.save(userId, DEFAULT_SETTINGS);
    });
  }, [userId]);

  const settings = useLiveQuery(async () => {
    if (!userId) return undefined;
    return settingsRepository.get(userId);
  }, [userId]);

  const update = (changes: Partial<SettingsInput>) => {
    if (!userId || !settings) return;
    settingsRepository.save(userId, { ...settings, ...changes });
  };

  return { settings, update, isLoading: settings === undefined };
}
