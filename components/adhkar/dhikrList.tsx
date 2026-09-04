"use client";

import { useState } from "react";
import { useDhikrs } from "@/hooks/useDhikrs";
import EntityActions from "@/components/shared/EntityActions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Modal from "@/components/shared/Modal";
import Field from "@/components/shared/Field";
import Button from "@/components/shared/Button";
import type { DhikrCategory, DhikrEntity } from "@/types/adhkar";

export default function DhikrList({ category }: { category: DhikrCategory }) {
  const { dhikrs, addDhikr, incrementCount, updateDhikr, removeDhikr } =
    useDhikrs(category);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<DhikrEntity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [count, setCount] = useState("1");

  const openAdd = () => {
    setEditing(null);
    setText("");
    setCount("1");
    setIsFormOpen(true);
  };
  const openEdit = (d: DhikrEntity) => {
    setEditing(d);
    setText(d.text);
    setCount(String(d.target_count));
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!text.trim()) return;
    const target = parseInt(count, 10) || 1;
    if (editing) {
      updateDhikr(editing.id, { text: text.trim(), target_count: target });
    } else {
      addDhikr(text.trim(), target);
    }
    setIsFormOpen(false);
  };

  const sorted = [...dhikrs].sort((a, b) => {
    const aDone = a.current_count >= a.target_count;
    const bDone = b.current_count >= b.target_count;
    if (aDone !== bDone) return aDone ? 1 : -1;
    return a.order - b.order;
  });

  return (
    <div>
      <div className="overflow-hidden rounded-card-lg border border-app-border bg-app-surface px-4 shadow-card">
        {sorted.map((d) => {
          const isDone = d.current_count >= d.target_count;
          const remaining = Math.max(d.target_count - d.current_count, 0);
          return (
            <div
              key={d.id}
              onClick={() => incrementCount(d)}
              className={`flex cursor-pointer items-start gap-3 border-b border-app-border py-3.5 last:border-none ${
                isDone ? "opacity-50" : ""
              }`}
            >
              <div
                className={`mt-0.5 flex h-8 min-w-8 shrink-0 items-center justify-center rounded-card-sm px-1 text-[11px] font-bold ${
                  isDone
                    ? "bg-app-surface-2 text-app-text-2"
                    : "bg-app-primary-soft text-app-primary-soft-text"
                }`}
              >
                {isDone ? "تم" : remaining}
              </div>
              <div className="min-w-0 flex-1">
                <p className="wrap-break-word text-sm font-semibold leading-6 text-app-text">
                  {d.text}
                </p>
                {!isDone && (
                  <p className="mt-0.5 text-[11px] text-app-text-2">
                    متبقي للتكرار
                  </p>
                )}
              </div>
              <EntityActions
                onEdit={() => openEdit(d)}
                onDelete={() => setDeletingId(d.id)}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={openAdd}
        className="mt-2.5 w-full rounded-card-md bg-app-primary-soft py-3 text-[13.5px] font-bold text-app-primary-soft-text"
      >
        ＋ ذكر جديد
      </button>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editing ? "تعديل الذكر" : "ذكر جديد"}
        size="sm"
      >
        <Field
          label="نص الذكر"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب الذكر"
        />
        <Field
          label="العدد"
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          placeholder="1"
        />
        <Button onClick={handleSave} disabled={!text.trim()}>
          حفظ
        </Button>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) removeDhikr(deletingId);
          setDeletingId(null);
        }}
        title="حذف الذكر"
        message="هيتحذف نهائيًا من الليستة."
      />
    </div>
  );
}
