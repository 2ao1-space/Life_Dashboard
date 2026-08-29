import { CollectionRepository } from "../architecture/CollectionRepository";
import { db } from "../architecture/db";
import { HabitEntity } from "@/types/habits";

export const habitsRepository = new CollectionRepository<HabitEntity>(
  db.habits,
  "habits",
);
