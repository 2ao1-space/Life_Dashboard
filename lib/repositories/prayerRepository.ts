import { db } from "@/lib/architecture/db";
import { CollectionRepository } from "@/lib/architecture/CollectionRepository";
import type { PrayerDayEntity } from "@/types/prayer";

export const prayerRepository = new CollectionRepository<PrayerDayEntity>(
  db.prayer_days,
  "prayer_days",
);
