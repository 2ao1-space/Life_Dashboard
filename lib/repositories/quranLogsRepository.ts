import { QuranLogEntity } from "@/types/adhkar";
import { CollectionRepository } from "../architecture/CollectionRepository";
import { db } from "../architecture/db";

export const quranLogsRepository = new CollectionRepository<QuranLogEntity>(
  db.quran_logs,
  "quran_logs",
);
