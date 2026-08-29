import { NoteEntity } from "@/types/notes";
import { CollectionRepository } from "../architecture/CollectionRepository";
import { db } from "../architecture/db";

export const documentsRepository = new CollectionRepository<NoteEntity>(
  db.notes,
  "notes",
);
