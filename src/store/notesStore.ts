import { create } from "zustand";
import { getDB } from "@/lib/db";
import type { Note } from "@/types";
import { syncUpsertNote, syncDeleteNote } from "@/lib/syncEngine";

interface NotesState {
  notes: Note[];
  loadNotes: () => Promise<void>;
  addNote: (content: string, date?: string) => Promise<void>;
  updateNote: (id: number, content: string) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  togglePin: (id: number) => Promise<void>;
  reorderNotes: (orderedIds: number[]) => Promise<void>;
}

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (a.order !== b.order) return a.order - b.order;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],

  loadNotes: async () => {
    try {
      const all = await getDB().notes.toArray();
      set({ notes: sortNotes(all) });
    } catch (e) {
      console.error("loadNotes", e);
    }
  },

  addNote: async (content, date?) => {
    const db = getDB();
    const all = await db.notes.where("isPinned").equals(0).toArray();
    const minOrder = all.length ? Math.min(...all.map((n) => n.order)) : 0;
    const id = await db.notes.add({
      content,
      date,
      isPinned: false,
      order: minOrder - 1,
      createdAt: new Date(),
      synced: false,
    });
    const note = await db.notes.get(id as number);
    if (note?.id) syncUpsertNote(note as Note & { id: number });
    await get().loadNotes();
  },

  updateNote: async (id, content) => {
    await getDB().notes.update(id, { content, synced: false });
    const note = await getDB().notes.get(id);
    if (note?.id) syncUpsertNote(note as Note & { id: number });
    await get().loadNotes();
  },

  deleteNote: async (id) => {
    await getDB().notes.delete(id);
    syncDeleteNote(id);
    await get().loadNotes();
  },

  togglePin: async (id) => {
    const note = await getDB().notes.get(id);
    if (!note) return;
    await getDB().notes.update(id, { isPinned: !note.isPinned, synced: false });
    const updated = await getDB().notes.get(id);
    if (updated?.id) syncUpsertNote(updated as Note & { id: number });
    await get().loadNotes();
  },

  reorderNotes: async (orderedIds) => {
    const db = getDB();
    await Promise.all(
      orderedIds.map((id, i) =>
        db.notes.update(id, { order: i, synced: false }),
      ),
    );
    for (const id of orderedIds) {
      const note = await db.notes.get(id);
      if (note?.id) syncUpsertNote(note as Note & { id: number });
    }
    await get().loadNotes();
  },
}));
