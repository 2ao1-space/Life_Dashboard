"use client";

import { useState } from "react";
import EntityActions from "@/components/shared/EntityActions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import NoteFormModal from "./noteFormModal";
import { useNotes } from "@/hooks/useNotes";
import type { NoteEntity } from "@/types/notes";
import AppIcon from "@/components/shared/AppIcon";

interface NoteCardProps {
  note: NoteEntity;
  onOpenDetail?: (note: NoteEntity) => void;
}

export default function NoteCard({ note, onOpenDetail }: NoteCardProps) {
  const { togglePin, toggleTodoItem, removeNote } = useNotes();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openDetail = () => onOpenDetail?.(note);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openDetail}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDetail();
          }
        }}
        className="mb-3 cursor-pointer break-inside-avoid rounded-card-md border border-app-border bg-app-surface p-3.5 shadow-card outline-none focus-visible:ring-2 focus-visible:ring-app-primary"
      >
        <div className="mb-1.5 flex items-center justify-between">
          <h2 className="mb-1 wrap-break-word text-[13px] font-bold text-app-text">
            {note.title}
          </h2>

          <div className="flex shrink-0 items-center gap-1">
            {note.is_pinned && (
              <AppIcon name="pin" size={14} className="text-app-gold" />
            )}
            <EntityActions
              onEdit={() => setIsEditOpen(true)}
              onDelete={() => setIsDeleteOpen(true)}
            />
          </div>
        </div>

        {note.type === "text" && (
          <div className="space-y-2">
            <p className="whitespace-pre-wrap wrap-break-word text-xs leading-6 text-app-text-2">
              {note.body && note.body.length > 260
                ? `${note.body.slice(0, 260)}…`
                : note.body}
            </p>
            {note.body && note.body.length > 260 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openDetail();
                }}
                className="text-[10px] font-bold text-app-primary"
              >
                عرض كامل
              </button>
            )}
          </div>
        )}
        {note.type === "todo" && (
          <div className="space-y-1">
            {(note.todo_items ?? []).slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex min-w-0 items-center gap-1.5 text-xs"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTodoItem(note.id, item.id);
                  }}
                  className={`h-3.5 w-3.5 shrink-0 rounded border ${
                    item.done
                      ? "border-app-primary bg-app-primary"
                      : "border-app-border bg-transparent"
                  }`}
                  aria-label={item.done ? "إلغاء التحديد" : "تحديد المهمة"}
                />
                <span
                  className={`min-w-0 flex-1 wrap-break-word ${
                    item.done ? "text-app-text-2 line-through" : "text-app-text"
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        )}
        {note.type === "image" && note.image_data && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={note.image_data}
            alt=""
            className="rounded-card-sm object-cover"
          />
        )}
        {note.type === "drawing" && note.drawing_data && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={note.drawing_data} alt="" className="rounded-card-sm" />
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          removeNote(note.id);
          setIsDeleteOpen(false);
        }}
        title="حذف الملاحظة"
        message="هتتحذف نهائيًا."
      />

      {isEditOpen && (
        <NoteFormModal
          key={note.id}
          isOpen
          onClose={() => setIsEditOpen(false)}
          editing={note}
        />
      )}
    </>
  );
}
