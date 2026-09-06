"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import EntityActions from "@/components/shared/EntityActions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import EmptyState from "@/components/shared/EmptyState";

export default function TasksSection({ date }: { date?: Date }) {
  const { tasks, addTask, toggleTask, updateTaskText, removeTask } =
    useTasks(date);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newText.trim()) return;
    addTask(newText.trim());
    setNewText("");
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = () => {
    if (editingId && editingText.trim()) {
      updateTaskText(editingId, editingText.trim());
    }
    setEditingId(null);
  };

  return (
    <div>
      <div className="mt-2.5 flex gap-2 mb-4">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="مهمة جديدة..."
          dir="rtl"
          className="min-w-0 flex-1 rounded-card-sm border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text outline-none focus:border-app-primary"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="shrink-0 rounded-card-sm bg-app-primary px-4 text-sm font-bold text-white"
        >
          ＋
        </button>
      </div>
      <div className="rounded-card-lg border border-app-border bg-app-surface px-4 shadow-card">
        {tasks.length === 0 ? (
          <EmptyState icon="habits" title="مفيش مهام النهاردة" />
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex min-w-0 items-center gap-2.5 border-b border-app-border py-2.5 last:border-none"
            >
              <button
                type="button"
                onClick={() => toggleTask(task.id, task.done)}
                className={`h-5 w-5 shrink-0 rounded-md border-2 ${
                  task.done
                    ? "border-app-primary bg-app-primary"
                    : "border-app-border"
                }`}
              />
              {editingId === task.id ? (
                <input
                  autoFocus
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  className="min-w-0 flex-1 border-b border-app-primary bg-transparent text-sm text-app-text outline-none"
                />
              ) : (
                <span
                  className={`min-w-0 flex-1 break-words text-sm ${task.done ? "text-app-text-2 line-through" : "text-app-text"}`}
                >
                  {task.text}
                </span>
              )}
              <EntityActions
                onEdit={() => startEdit(task.id, task.text)}
                onDelete={() => setDeletingId(task.id)}
              />
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) removeTask(deletingId);
          setDeletingId(null);
        }}
        title="حذف المهمة"
        message="هتتحذف نهائيًا من الليستة."
      />
    </div>
  );
}
