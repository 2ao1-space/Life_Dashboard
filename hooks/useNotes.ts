"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { notesRepository } from "@/lib/repositories/notesRepository";
import type { NoteEntity } from "@/types/notes";

type NoteInput = Omit<
  NoteEntity,
  "id" | "user_id" | "updated_at" | "sync_status" | "deleted"
>;

export function useNotes() {
  const { userId } = useUserId();

  const notes = useLiveQuery(async () => {
    if (!userId) return undefined;
    const all = await notesRepository.getAll(userId);
    return all.sort(
      (a, b) => Number(b.is_pinned) - Number(a.is_pinned) || a.order - b.order,
    );
  }, [userId]);

  const addNote = (
    data: Partial<NoteInput> & Pick<NoteInput, "type" | "title">,
  ) => {
    if (!userId) return;
    notesRepository.create(userId, {
      category_name: "عام",
      category_color: "#2F6F5E",
      is_pinned: false,
      order: notes?.length ?? 0,
      body: null,
      todo_items: null,
      image_data: null,
      caption: null,
      drawing_data: null,
      ...data,
    });
  };

  const updateNote = (id: string, changes: Partial<NoteInput>) => {
    notesRepository.update(id, changes);
  };

  const togglePin = (note: NoteEntity) => {
    notesRepository.update(note.id, { is_pinned: !note.is_pinned });
  };

  const removeNote = (id: string) => {
    notesRepository.remove(id);
  };

  return {
    notes: notes ?? [],
    addNote,
    updateNote,
    togglePin,
    removeNote,
    isLoading: notes === undefined,
  };
}
