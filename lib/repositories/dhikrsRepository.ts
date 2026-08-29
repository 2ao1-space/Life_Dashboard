import { DhikrEntity } from "@/types/adhkar";
import { CollectionRepository } from "../architecture/CollectionRepository";
import { db } from "../architecture/db";

export const dhikrsRepository = new CollectionRepository<DhikrEntity>(
  db.dhikrs,
  "dhikrs",
);
