"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import Field from "@/components/shared/Field";
import Button from "@/components/shared/Button";
import DrawingCanvas from "./drawingCanvas";
import { useNotes } from "@/hooks/useNotes";
import type { NoteEntity, NoteType, TodoItem } from "@/types/notes";

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: NoteEntity | null;
  initialType?: NoteType;
}

const TYPE_OPTIONS: { value: NoteType; label: string; icon: string }[] = [
  { value: "text", label: "نص", icon: "📝" },
  { value: "todo", label: "تودو", icon: "✅" },
  { value: "image", label: "صورة", icon: "🖼️" },
  { value: "drawing", label: "رسمة", icon: "✏️" },
];

export default function NoteFormModal({
  isOpen,
  onClose,
  editing,
  initialType,
}: NoteFormModalProps) {
  const { addNote, updateNote } = useNotes();

  const [type, setType] = useState<NoteType>(
    editing?.type ?? initialType ?? "text",
  );
  const [title, setTitle] = useState(editing?.title ?? "");
  const [body, setBody] = useState(editing?.body ?? "");
  const [todoItems, setTodoItems] = useState<TodoItem[]>(
    editing?.todo_items ?? [],
  );
  const [newTodoText, setNewTodoText] = useState("");
  const [imageData, setImageData] = useState(editing?.image_data ?? "");
  const [caption, setCaption] = useState(editing?.caption ?? "");
  const [drawingData, setDrawingData] = useState(editing?.drawing_data ?? "");

  const addTodoItem = () => {
    if (!newTodoText.trim()) return;
    setTodoItems([
      ...todoItems,
      { id: crypto.randomUUID(), text: newTodoText.trim(), done: false },
    ]);
    setNewTodoText("");
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const isValid = title.trim().length > 0;

  const handleSave = () => {
    if (!isValid) return;
    const payload = {
      type,
      title: title.trim(),
      body: type === "text" ? body : null,
      todo_items: type === "todo" ? todoItems : null,
      image_data: type === "image" ? imageData || null : null,
      caption: type === "image" ? caption : null,
      drawing_data: type === "drawing" ? drawingData || null : null,
    };
    if (editing) {
      updateNote(editing.id, payload);
    } else {
      addNote(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "تعديل الملاحظة" : "ملاحظة جديدة"}
      size="md"
    >
      {!editing && (
        <div className="mb-4 grid grid-cols-4 gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`flex flex-col items-center gap-1 rounded-card-sm border py-2.5 text-[11px] font-semibold ${
                type === opt.value
                  ? "border-app-primary bg-app-primary-soft text-app-primary-soft-text"
                  : "border-app-border text-app-text-2"
              }`}
            >
              <span className="text-base">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <Field
        label="العنوان"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="عنوان الملاحظة"
      />

      {type === "text" && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-app-text-2">
            المحتوى
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            dir="rtl"
            className="w-full rounded-card-sm border border-app-border bg-app-bg px-3 py-2.5 text-sm text-app-text outline-none focus:border-app-primary"
          />
        </div>
      )}

      {type === "todo" && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-app-text-2">
            المهام
          </label>
          {todoItems.map((item) => (
            <div key={item.id} className="mb-1.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setTodoItems(
                    todoItems.map((t) =>
                      t.id === item.id ? { ...t, done: !t.done } : t,
                    ),
                  )
                }
                className={`h-4 w-4 shrink-0 rounded border-2 ${
                  item.done
                    ? "border-app-primary bg-app-primary"
                    : "border-app-border"
                }`}
              />
              <span
                className={`flex-1 text-sm ${item.done ? "text-app-text-2 line-through" : "text-app-text"}`}
              >
                {item.text}
              </span>
              <button
                type="button"
                onClick={() =>
                  setTodoItems(todoItems.filter((t) => t.id !== item.id))
                }
                className="text-xs text-app-danger"
              >
                ×
              </button>
            </div>
          ))}
          <div className="mt-2 flex gap-2">
            <input
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodoItem()}
              placeholder="مهمة جديدة..."
              dir="rtl"
              className="flex-1 rounded-card-sm border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text outline-none focus:border-app-primary"
            />
            <button
              type="button"
              onClick={addTodoItem}
              className="rounded-card-sm bg-app-primary-soft px-3 text-app-primary-soft-text"
            >
              ＋
            </button>
          </div>
        </div>
      )}

      {type === "image" && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-app-text-2">
            الصورة
          </label>
          {imageData && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageData}
              alt=""
              className="mb-2 h-32 w-full rounded-card-sm object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImagePick}
            className="mb-3 text-xs"
          />
          <Field
            label="نص مصاحب"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="اكتب وصف الصورة"
          />
        </div>
      )}

      {type === "drawing" && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-app-text-2">
            الرسمة
          </label>
          <DrawingCanvas
            initialData={drawingData || null}
            onChange={setDrawingData}
          />
        </div>
      )}

      <Button onClick={handleSave} disabled={!isValid}>
        حفظ
      </Button>
    </Modal>
  );
}
