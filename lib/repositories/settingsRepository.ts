import { db } from "@/lib/architecture/db";
import { SingleValueRepository } from "@/lib/architecture/SingleValueRepository";
import type { SettingsEntity } from "@/lib/types/settings";

export const settingsRepository = new SingleValueRepository<SettingsEntity>(
  db.settings,
  "settings",
);
