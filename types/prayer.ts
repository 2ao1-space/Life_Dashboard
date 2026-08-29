import type { BaseEntity } from "@/lib/architecture/db";

export type FardStatus = "pending" | "done" | "missed";

export interface PrayerDayEntity extends BaseEntity {
  date: string;

  fajr_status: FardStatus;
  dhuhr_status: FardStatus;
  asr_status: FardStatus;
  maghrib_status: FardStatus;
  isha_status: FardStatus;

  fajr_qabliyah: boolean;
  dhuhr_qabliyah_1: boolean;
  dhuhr_qabliyah_2: boolean;
  dhuhr_badiyah: boolean;
  asr_nafilah: boolean;
  maghrib_badiyah: boolean;
  isha_badiyah: boolean;

  qiyam_rakaat: number;
  shafa_done: boolean;
  witr_done: boolean;

  quran_pages_read: number;
}

export const DEFAULT_PRAYER_DAY: Omit<
  PrayerDayEntity,
  "id" | "user_id" | "updated_at" | "sync_status" | "deleted" | "date"
> = {
  fajr_status: "pending",
  dhuhr_status: "pending",
  asr_status: "pending",
  maghrib_status: "pending",
  isha_status: "pending",
  fajr_qabliyah: false,
  dhuhr_qabliyah_1: false,
  dhuhr_qabliyah_2: false,
  dhuhr_badiyah: false,
  asr_nafilah: false,
  maghrib_badiyah: false,
  isha_badiyah: false,
  qiyam_rakaat: 0,
  shafa_done: false,
  witr_done: false,
  quran_pages_read: 0,
};
