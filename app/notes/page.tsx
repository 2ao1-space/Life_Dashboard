"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useNotes } from "@/hooks/useNotes";
import NoteCard from "@/components/notes/noteCard";
import NoteFormModal from "@/components/notes/noteFormModal";
import EmptyState from "@/components/shared/EmptyState";
import Fab from "@/components/shared/Fab";
import Modal from "@/components/shared/Modal";
import EntityActions from "@/components/shared/EntityActions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import AppIcon from "@/components/shared/AppIcon";
import type { NoteEntity } from "@/types/notes";

export default function NotesPage() {
  const { notes, togglePin, toggleTodoItem, removeNote } = useNotes();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [selectedNote, setSelectedNote] = useState<NoteEntity | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openAdd = () => {
    setFormKey((k) => k + 1);
    setIsAddOpen(true);
  };

  return (
    <main className="mx-auto max-w-md space-y-5 px-4 pb-28 pt-5">
      {notes.length === 0 ? (
        <EmptyState icon="notes" title="مفيش ملاحظات لسه" />
      ) : (
        <div className="columns-2 gap-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onOpenDetail={(detailNote) => setSelectedNote(detailNote)}
            />
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

      {selectedNote && (
        <Modal
          isOpen={Boolean(selectedNote)}
          onClose={() => setSelectedNote(null)}
          title={selectedNote.title}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  togglePin(selectedNote);
                  setSelectedNote({
                    ...selectedNote,
                    is_pinned: !selectedNote.is_pinned,
                  });
                }}
                className={`rounded-full p-2 ${
                  selectedNote.is_pinned ? "text-app-gold" : "text-app-text-2"
                }`}
              >
                <AppIcon name="pin" size={17} />
              </button>
              <EntityActions
                onEdit={() => {
                  setSelectedNote(null);
                  setIsEditOpen(true);
                }}
                onDelete={() => {
                  setSelectedNote(null);
                  setIsDeleteOpen(true);
                }}
                size={15}
              />
              <button
                type="button"
                onClick={() => setSelectedNote(null)}
                className="rounded-full p-2 text-app-text-2 hover:bg-app-surface-2"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {selectedNote.type === "text" && (
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-7 text-app-text-2">
                {selectedNote.body}
              </p>
            )}

            {selectedNote.type === "todo" && (
              <div className="space-y-2">
                {(selectedNote.todo_items ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 items-center gap-2 rounded-card-sm bg-app-surface-2 p-2 text-sm"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTodoItem(selectedNote.id, item.id)}
                      className={`h-4 w-4 shrink-0 rounded border-2 ${
                        item.done
                          ? "border-app-primary bg-app-primary"
                          : "border-app-border"
                      }`}
                    />
                    <span
                      className={`min-w-0 flex-1 wrap-break-word ${
                        item.done
                          ? "text-app-text-2 line-through"
                          : "text-app-text"
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {selectedNote.type === "image" && selectedNote.image_data && (
              <>
                <img
                  src={selectedNote.image_data}
                  alt=""
                  className="w-full rounded-card-sm"
                />
                {selectedNote.caption && (
                  <p className="wrap-break-word text-sm text-app-text-2">
                    {selectedNote.caption}
                  </p>
                )}
              </>
            )}

            {selectedNote.type === "drawing" && selectedNote.drawing_data && (
              <img
                src={selectedNote.drawing_data}
                alt=""
                className="w-full rounded-card-sm"
              />
            )}
          </div>
        </Modal>
      )}

      {isEditOpen && selectedNote && (
        <NoteFormModal
          key={selectedNote.id}
          isOpen
          onClose={() => setIsEditOpen(false)}
          editing={selectedNote}
        />
      )}

      {isDeleteOpen && selectedNote && (
        <ConfirmModal
          isOpen
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() => {
            removeNote(selectedNote.id);
            setIsDeleteOpen(false);
            setSelectedNote(null);
          }}
          title="حذف الملاحظة"
          message="هتتحذف نهائيًا."
        />
      )}
    </main>
  );
}
