import { db } from "@/lib/architecture/db";
import { CollectionRepository } from "@/lib/architecture/CollectionRepository";
import type { NoteEntity } from "@/types/notes";

export const notesRepository = new CollectionRepository<NoteEntity>(
  db.notes,
  "notes",
);
