import { CollectionRepository } from "../architecture/CollectionRepository";
import { db } from "../architecture/db";
import { DocumentEntity } from "@/types/documents";

export const documentsRepository = new CollectionRepository<DocumentEntity>(
  db.documents,
  "documents",
);
