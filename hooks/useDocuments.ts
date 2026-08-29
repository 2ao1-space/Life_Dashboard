"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { documentsRepository } from "@/lib/repositories/documentsRepository";
import type { DocumentEntity } from "@/types/documents";

export function useDocuments() {
  const { userId } = useUserId();

  const documents = useLiveQuery(async () => {
    if (!userId) return undefined;
    const all = await documentsRepository.getAll(userId);
    return all.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [userId]);

  const addDocument = (data: {
    title: string;
    file_name: string;
    file_type: string;
    file_data: string;
  }) => {
    if (!userId) return;
    documentsRepository.create(userId, data);
  };

  const updateTitle = (id: string, title: string) => {
    documentsRepository.update(id, { title } as Partial<DocumentEntity>);
  };

  const removeDocument = (id: string) => {
    documentsRepository.remove(id);
  };

  return {
    documents: documents ?? [],
    addDocument,
    updateTitle,
    removeDocument,
    isLoading: documents === undefined,
  };
}
