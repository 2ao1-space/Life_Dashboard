"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import Field from "@/components/shared/Field";
import Button from "@/components/shared/Button";
import DrawingCanvas from "./drawingCanvas";
import { useNotes } from "@/hooks/useNotes";
import type { NoteEntity, NoteType, TodoItem } from "@/types/notes";
import AppIcon from "@/components/shared/AppIcon";

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: NoteEntity | null;
  initialType?: NoteType;
}

const TYPE_OPTIONS: { value: NoteType; label: string; icon: string }[] = [
  { value: "text", label: "نص", icon: "notes" },
  { value: "todo", label: "تودو", icon: "habits" },
  { value: "image", label: "صورة", icon: "file-image" },
  { value: "drawing", label: "رسمة", icon: "drawing" },
];

export default function NoteFormModal({
  isOpen,
  onClose,
  editing,
  initialType,
}: NoteFormModalProps) {
  const { addNote, updateNote } = useNotes();
  const draftKey = editing
    ? `hayati-note-draft-${editing.id}`
    : "hayati-note-draft-new";

  const readSavedDraft = () => {
    if (typeof window === "undefined") return null;

    try {
      const saved = localStorage.getItem(draftKey);
      if (!saved) return null;
      return JSON.parse(saved) as {
        type?: NoteType;
        title?: string;
        body?: string;
        todo_items?: TodoItem[];
        image_data?: string;
        caption?: string;
        drawing_data?: string;
      };
    } catch {
      localStorage.removeItem(draftKey);
      return null;
    }
  };

  const savedDraft = readSavedDraft();

  const [type, setType] = useState<NoteType>(
    savedDraft?.type ?? editing?.type ?? initialType ?? "text",
  );
  const [title, setTitle] = useState(savedDraft?.title ?? editing?.title ?? "");
  const [body, setBody] = useState(savedDraft?.body ?? editing?.body ?? "");
  const [todoItems, setTodoItems] = useState<TodoItem[]>(
    savedDraft?.todo_items ?? editing?.todo_items ?? [],
  );
  const [newTodoText, setNewTodoText] = useState("");
  const [imageData, setImageData] = useState(
    savedDraft?.image_data ?? editing?.image_data ?? "",
  );
  const [caption, setCaption] = useState(
    savedDraft?.caption ?? editing?.caption ?? "",
  );
  const [drawingData, setDrawingData] = useState(
    savedDraft?.drawing_data ?? editing?.drawing_data ?? "",
  );

  const saveDraft = (nextState?: {
    type?: NoteType;
    title?: string;
    body?: string;
    todoItems?: TodoItem[];
    imageData?: string;
    caption?: string;
    drawingData?: string;
  }) => {
    if (typeof window === "undefined") return;
    const payload = {
      type: nextState?.type ?? type,
      title: nextState?.title ?? title,
      body: nextState?.body ?? body,
      todo_items: nextState?.todoItems ?? todoItems,
      image_data: nextState?.imageData ?? imageData,
      caption: nextState?.caption ?? caption,
      drawing_data: nextState?.drawingData ?? drawingData,
    };

    if (
      payload.title.trim() ||
      payload.body?.trim() ||
      payload.todo_items?.length ||
      payload.image_data ||
      payload.caption?.trim() ||
      payload.drawing_data
    ) {
      localStorage.setItem(draftKey, JSON.stringify(payload));
      return;
    }

    localStorage.removeItem(draftKey);
  };

  const addTodoItem = () => {
    if (!newTodoText.trim()) return;
    const nextItems = [
      ...todoItems,
      { id: crypto.randomUUID(), text: newTodoText.trim(), done: false },
    ];
    setTodoItems(nextItems);
    saveDraft({ todoItems: nextItems });
    setNewTodoText("");
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const nextImageData = reader.result as string;
      setImageData(nextImageData);
      saveDraft({ imageData: nextImageData });
    };
    reader.readAsDataURL(file);
  };

  const isValid = title.trim().length > 0;

  useEffect(() => {
    const persistOnClose = () => saveDraft();
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") saveDraft();
    };

    window.addEventListener("beforeunload", persistOnClose);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("beforeunload", persistOnClose);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [type, title, body, todoItems, imageData, caption, drawingData]);

  const closeForm = () => {
    saveDraft();
    onClose();
  };

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
    localStorage.removeItem(draftKey);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeForm}
      title={editing ? "تعديل الملاحظة" : "ملاحظة جديدة"}
      size="md"
    >
      {!editing && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setType(opt.value);
                saveDraft({ type: opt.value });
              }}
              className={`flex flex-col items-center gap-1 rounded-card-sm border py-2.5 text-[11px] font-semibold ${
                type === opt.value
                  ? "border-app-primary bg-app-primary-soft text-app-primary-soft-text"
                  : "border-app-border text-app-text-2"
              }`}
            >
              <AppIcon name={opt.icon} size={18} />
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <Field
        label="العنوان"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          saveDraft({ title: e.target.value });
        }}
        placeholder="عنوان الملاحظة"
      />

      {type === "text" && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-app-text-2">
            المحتوى
          </label>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              saveDraft({ body: e.target.value });
            }}
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
                onClick={() => {
                  const nextItems = todoItems.map((t) =>
                    t.id === item.id ? { ...t, done: !t.done } : t,
                  );
                  setTodoItems(nextItems);
                  saveDraft({ todoItems: nextItems });
                }}
                className={`h-4 w-4 shrink-0 rounded border-2 ${
                  item.done
                    ? "border-app-primary bg-app-primary"
                    : "border-app-border"
                }`}
              />
              <span
                className={`min-w-0 flex-1 wrap-break-word text-sm ${item.done ? "text-app-text-2 line-through" : "text-app-text"}`}
              >
                {item.text}
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextItems = todoItems.filter((t) => t.id !== item.id);
                  setTodoItems(nextItems);
                  saveDraft({ todoItems: nextItems });
                }}
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
              className="min-w-0 flex-1 rounded-card-sm border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text outline-none focus:border-app-primary"
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
