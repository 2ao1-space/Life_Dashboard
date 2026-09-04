"use client";

import { useState } from "react";
import EntityActions from "@/components/shared/EntityActions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import NoteFormModal from "./noteFormModal";
import { useNotes } from "@/hooks/useNotes";
import type { NoteEntity } from "@/types/notes";
import AppIcon from "@/components/shared/AppIcon";

export default function NoteCard({ note }: { note: NoteEntity }) {
  const { togglePin, removeNote } = useNotes();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsDetailOpen(true)}
        className="mb-3 cursor-pointer break-inside-avoid rounded-card-md border border-app-border bg-app-surface p-3.5 shadow-card"
      >
        <div className="mb-1.5 flex items-center justify-between">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: note.category_color }}
          />
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

        <p className="mb-1 break-words text-[13px] font-bold text-app-text">
          {note.title}
        </p>

        {note.type === "text" && (
          <p className="line-clamp-4 whitespace-pre-wrap break-words text-xs text-app-text-2">
            {note.body}
          </p>
        )}
        {note.type === "todo" && (
          <div className="space-y-1">
            {(note.todo_items ?? []).slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex min-w-0 items-center gap-1.5 text-xs"
              >
                <span
                  className={`h-3 w-3 shrink-0 rounded border ${
                    item.done
                      ? "border-app-primary bg-app-primary"
                      : "border-app-border"
                  }`}
                />
                <span
                  className={`min-w-0 flex-1 break-words ${
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

      {isDetailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-card-lg bg-app-surface p-5 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h2 className="min-w-0 flex-1 break-words text-base font-bold text-app-text">
                {note.title}
              </h2>
              <button
                type="button"
                onClick={() => togglePin(note)}
                className={`shrink-0 ${note.is_pinned ? "text-app-gold" : "text-app-text-2"}`}
              >
                <AppIcon name="pin" size={17} />
              </button>
            </div>
            {note.type === "text" && (
              <p className="whitespace-pre-wrap break-words text-sm text-app-text-2">
                {note.body}
              </p>
            )}
            {note.type === "todo" && (
              <div className="space-y-2">
                {(note.todo_items ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 items-center gap-2 text-sm"
                  >
                    <span
                      className={`h-4 w-4 shrink-0 rounded border-2 ${
                        item.done
                          ? "border-app-primary bg-app-primary"
                          : "border-app-border"
                      }`}
                    />
                    <span
                      className={`min-w-0 flex-1 break-words ${
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
            {note.type === "image" && note.image_data && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={note.image_data}
                  alt=""
                  className="mb-2 w-full rounded-card-sm"
                />
                {note.caption && (
                  <p className="break-words text-sm text-app-text-2">
                    {note.caption}
                  </p>
                )}
              </>
            )}
            {note.type === "drawing" && note.drawing_data && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={note.drawing_data}
                alt=""
                className="w-full rounded-card-sm"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
