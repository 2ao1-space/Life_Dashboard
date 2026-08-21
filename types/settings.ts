import type { BaseEntity } from "@/lib/architecture/db";

export type ModuleKey =
  | "finance"
  | "prayer"
  | "adhkar"
  | "habits"
  | "notes"
  | "documents"
  | "analytics";

export interface ProfileEntity extends BaseEntity {
  name: string | null;
  birth_date: string | null;
  location_city: string | null;
  location_lat: number | null;
  location_lng: number | null;
  google_linked: boolean;
}

export interface SettingsEntity extends BaseEntity {
  visible_modules: ModuleKey[];
  nawafil_enabled: boolean;
  qiyam_enabled: boolean;
  debts_enabled: boolean;
  zakat_enabled: boolean;
}

export interface AccountEntity extends BaseEntity {
  name: string;
  icon: string;
  balance: number;
  is_default: boolean;
  order: number;
}

export const DEFAULT_SETTINGS: Omit<
  SettingsEntity,
  "id" | "user_id" | "updated_at" | "sync_status" | "deleted"
> = {
  visible_modules: ["finance", "prayer", "habits", "analytics"],
  nawafil_enabled: false,
  qiyam_enabled: false,
  debts_enabled: false,
  zakat_enabled: false,
};
