import type { BaseEntity } from "@/lib/architecture/db";

export type DhikrCategory = "morning" | "evening";

export interface DhikrEntity extends BaseEntity {
  category: DhikrCategory;
  text: string;
  target_count: number;
  current_count: number;
  order: number;
}

export interface DuaEntity extends BaseEntity {
  text: string;
  category_name: string;
  category_color: string;
  is_pinned: boolean;
}

export interface QuranLogEntity extends BaseEntity {
  date: string;
  pages_read: number;
  quarters_read: number;
  note: string | null;
}

export const TOTAL_QURAN_PAGES = 604;
export const PAGES_PER_QUARTER = 2.5;
