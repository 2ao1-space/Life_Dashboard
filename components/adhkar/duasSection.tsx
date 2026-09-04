"use client";

import { useState } from "react";
import { useDuas } from "@/hooks/useDuas";
import EntityActions from "@/components/shared/EntityActions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Modal from "@/components/shared/Modal";
import Field from "@/components/shared/Field";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import type { DuaEntity } from "@/types/adhkar";
import AppIcon from "@/components/shared/AppIcon";

const COLOR_OPTIONS = ["#2F6F5E", "#B8935F", "#B5654F", "#5F7FB8", "#8F5FB8"];

export default function DuasSection() {
  const { duas, addDua, updateDua, togglePin, removeDua } = useDuas();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<DuaEntity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  const openAdd = () => {
    setEditing(null);
    setText("");
    setCategoryName("");
    setColor(COLOR_OPTIONS[0]);
    setIsFormOpen(true);
  };
  const openEdit = (d: DuaEntity) => {
    setEditing(d);
    setText(d.text);
    setCategoryName(d.category_name);
    setColor(d.category_color);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!text.trim()) return;
    const payload = {
      text: text.trim(),
      category_name: categoryName.trim() || "عام",
      category_color: color,
    };
    if (editing) {
      updateDua(editing.id, payload);
    } else {
      addDua(payload);
    }
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="rounded-card-lg border border-app-border bg-app-surface px-4 shadow-card">
        {duas.length === 0 ? (
          <EmptyState icon="dua" title="مفيش أدعية شخصية لسه" />
        ) : (
          duas.map((d) => (
            <div
              key={d.id}
              className="flex items-start gap-3 border-b border-app-border py-3 last:border-none"
            >
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.category_color }}
              />
              <div className="min-w-0 flex-1">
                <p className="break-words text-[13.5px] font-semibold text-app-text">
                  {d.text}
                </p>
                <p className="text-[11px] text-app-text-2">{d.category_name}</p>
              </div>
              <button
                type="button"
                onClick={() => togglePin(d)}
                className={`shrink-0 text-sm ${d.is_pinned ? "text-app-gold" : "text-app-text-2"}`}
              >
                <AppIcon name="pin" size={16} />
              </button>
              <EntityActions
                onEdit={() => openEdit(d)}
                onDelete={() => setDeletingId(d.id)}
              />
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={openAdd}
        className="mt-2.5 w-full rounded-card-md bg-app-primary-soft py-3 text-[13.5px] font-bold text-app-primary-soft-text"
      >
        ＋ دعاء جديد
      </button>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editing ? "تعديل الدعاء" : "دعاء جديد"}
        size="sm"
      >
        <Field
          label="نص الدعاء"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب الدعاء"
        />
        <Field
          label="الفئة"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="مثال: دعاء الرزق"
        />
        <div className="mb-4 flex gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-app-text" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <Button onClick={handleSave} disabled={!text.trim()}>
          حفظ
        </Button>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) removeDua(deletingId);
          setDeletingId(null);
        }}
        title="حذف الدعاء"
        message="هيتحذف نهائيًا من الليستة."
      />
    </div>
  );
}
