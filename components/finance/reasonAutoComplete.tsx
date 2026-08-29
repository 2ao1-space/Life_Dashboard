"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTransactionReasons } from "@/hooks/useTransactionReasons";
import ConfirmModal from "@/components/shared/ConfirmModal";

interface ReasonAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ReasonAutocomplete({
  value,
  onChange,
}: ReasonAutocompleteProps) {
  const { reasons, removeReason } = useTransactionReasons();
  const [isOpen, setIsOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = reasons.filter((r) => r.text.includes(value.trim()));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative mb-4" ref={containerRef}>
      <label className="mb-1.5 block text-xs font-semibold text-app-text-2">
        السبب (اختياري)
      </label>
      <input
        type="text"
        dir="rtl"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="مثال: مواصلات"
        className="w-full rounded-card-sm border border-app-border bg-app-bg px-3 py-2.5 text-sm text-app-text outline-none focus:border-app-primary"
      />

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-card-sm border border-app-border bg-app-surface shadow-card">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between px-3 py-2.5 text-sm hover:bg-app-surface-2"
            >
              <button
                type="button"
                onClick={() => {
                  onChange(r.text);
                  setIsOpen(false);
                }}
                className="flex-1 text-right text-app-text"
              >
                {r.text}
              </button>
              <button
                type="button"
                onClick={() => setDeletingId(r.id)}
                aria-label="حذف السبب"
                className="p-1 text-app-text-2 hover:text-app-danger"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) removeReason(deletingId);
          setDeletingId(null);
        }}
        title="حذف السبب"
        message="هيتشال من الأسباب المقترحة بس. المعاملات القديمة اللي استخدمته مش هتتأثر."
      />
    </div>
  );
}
