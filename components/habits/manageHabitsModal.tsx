"use client";

import { useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import EntityActions from "@/components/shared/EntityActions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Modal from "@/components/shared/Modal";
import Field from "@/components/shared/Field";
import Button from "@/components/shared/Button";
import type { HabitEntity } from "@/types/habits";

export default function ManageHabitsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { habits, addHabit, updateHabit, removeHabit } = useHabits();
  const [editing, setEditing] = useState<HabitEntity | null>(null);
  const [name, setName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim()) return;
    if (editing) {
      updateHabit(editing.id, name.trim());
    } else {
      addHabit(name.trim());
    }
    setName("");
    setEditing(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل العادات" size="sm">
      <div className="mb-4">
        {habits.map((h) => (
          <div
            key={h.id}
            className="flex items-center gap-2 border-b border-app-border py-2 last:border-none"
          >
            <span className="flex-1 text-sm text-app-text">{h.name}</span>
            <EntityActions
              onEdit={() => {
                setEditing(h);
                setName(h.name);
              }}
              onDelete={() => setDeletingId(h.id)}
            />
          </div>
        ))}
      </div>

      <Field
        label={editing ? "تعديل العادة" : "عادة جديدة"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="مثال: قراءة"
      />
      <Button onClick={handleSave} disabled={!name.trim()}>
        {editing ? "حفظ التعديل" : "إضافة"}
      </Button>

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) removeHabit(deletingId);
          setDeletingId(null);
        }}
        title="حذف العادة"
        message="هتتحذف نهائيًا مع كل سجل إنجازها السابق."
      />
    </Modal>
  );
}
