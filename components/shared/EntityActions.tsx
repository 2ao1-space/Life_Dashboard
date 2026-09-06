"use client";

import { Eye, Pencil, Trash2, Share2 } from "lucide-react";

interface EntityActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  size?: number;
}

export default function EntityActions({
  onView,
  onEdit,
  onDelete,
  onShare,
  size = 16,
}: EntityActionsProps) {
  return (
    <div
      className="flex shrink-0 items-center gap-0.5"
      onClick={(e) => e.stopPropagation()}
    >
      {onView && (
        <button
          type="button"
          onClick={onView}
          aria-label="عرض"
          className="rounded-full p-2 text-app-text-2 hover:bg-app-surface-2"
        >
          <Eye size={size} />
        </button>
      )}
      {onShare && (
        <button
          type="button"
          onClick={onShare}
          aria-label="مشاركة"
          className="rounded-full p-2 text-app-text-2 hover:bg-app-surface-2"
        >
          <Share2 size={size} />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="تعديل"
          className="rounded-full p-2 text-app-text-2 hover:bg-app-surface-2"
        >
          <Pencil size={size} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="حذف"
          className="rounded-full p-2 text-app-danger hover:bg-app-danger-soft"
        >
          <Trash2 size={size} />
        </button>
      )}
    </div>
  );
}
