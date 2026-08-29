import { DuaEntity } from "@/types/adhkar";
import { CollectionRepository } from "../architecture/CollectionRepository";
import { db } from "../architecture/db";

export const duasRepository = new CollectionRepository<DuaEntity>(
  db.duas,
  "duas",
);
