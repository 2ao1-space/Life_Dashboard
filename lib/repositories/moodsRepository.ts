import { CollectionRepository } from "../architecture/CollectionRepository";
import { db } from "../architecture/db";
import { MoodEntity } from "@/types/habits";

export const moodsRepository = new CollectionRepository<MoodEntity>(
  db.moods,
  "moods",
);
