import { CollectionRepository } from "../architecture/CollectionRepository";
import { db } from "../architecture/db";
import { HabitLogEntity } from "@/types/habits";

export const habitLogsRepository = new CollectionRepository<HabitLogEntity>(
  db.habit_logs,
  "habit_logs",
);
