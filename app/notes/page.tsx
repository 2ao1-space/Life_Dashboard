"use client";

import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import NoteCard from "@/components/notes/noteCard";
import NoteFormModal from "@/components/notes/noteFormModal";
import EmptyState from "@/components/shared/EmptyState";
import Fab from "@/components/shared/Fab";

export default function NotesPage() {
  const { notes } = useNotes();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const openAdd = () => {
    setFormKey((k) => k + 1);
    setIsAddOpen(true);
  };

  return (
    <main className="mx-auto max-w-md space-y-5 px-4 pb-28 pt-5">
      <h1 className="text-lg font-extrabold text-app-text">الملاحظات</h1>

      {notes.length === 0 ? (
        <EmptyState icon="📝" title="مفيش ملاحظات لسه" />
      ) : (
        <div className="columns-2 gap-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      <Fab label="ملاحظة جديدة" onClick={openAdd} />
      {isAddOpen && (
        <NoteFormModal
          key={formKey}
          isOpen
          onClose={() => setIsAddOpen(false)}
        />
      )}
    </main>
  );
}
