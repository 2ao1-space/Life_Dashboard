"use client";

import { useState } from "react";
import EntityActions from "@/components/shared/EntityActions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Modal from "@/components/shared/Modal";
import Field from "@/components/shared/Field";
import Button from "@/components/shared/Button";
import { useDocuments } from "@/hooks/useDocuments";
import type { DocumentEntity } from "@/types/documents";

function iconFor(fileType: string | undefined | null) {
  if (!fileType) return "📁";
  if (fileType.startsWith("image/")) return "🖼️";
  if (fileType === "application/pdf") return "📄";
  return "📁";
}

export default function DocumentRow({ doc }: { doc: DocumentEntity }) {
  const { updateTitle, removeDocument } = useDocuments();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [title, setTitle] = useState(doc.title);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        const res = await fetch(doc.file_data);
        const blob = await res.blob();
        const file = new File([blob], doc.file_name, {
          type: doc.file_type || "application/octet-stream",
        });
        await navigator.share({ files: [file], title: doc.title });
      } else {
        window.open(doc.file_data, "_blank");
      }
    } catch {
      console.log("فشل المشاركة. حاول تاني.");
    }
  };

  const handleSaveTitle = () => {
    if (!title.trim()) return;
    updateTitle(doc.id, title.trim());
    setIsEditOpen(false);
  };

  return (
    <>
      <div
        onClick={() => setIsViewOpen(true)}
        className="flex cursor-pointer items-center gap-3 border-b border-app-border py-3 last:border-none"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card-sm bg-app-surface-2 text-lg">
          {iconFor(doc.file_type)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold text-app-text">
            {doc.title}
          </p>
          <p className="text-[11px] text-app-text-2">
            {new Date(doc.updated_at).toLocaleDateString("ar-EG")}
          </p>
        </div>
        <EntityActions
          onEdit={() => setIsEditOpen(true)}
          onDelete={() => setIsDeleteOpen(true)}
          onShare={handleShare}
        />
      </div>

      {isViewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsViewOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-card-lg bg-app-surface p-4 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 text-sm font-bold text-app-text">{doc.title}</p>
            {doc.file_type?.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={doc.file_data}
                alt={doc.title}
                className="w-full rounded-card-sm"
              />
            ) : (
              <a
                href={doc.file_data}
                download={doc.file_name}
                className="block rounded-card-sm bg-app-primary-soft py-3 text-center text-sm font-bold text-app-primary-soft-text"
              >
                تحميل الملف
              </a>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="تعديل اسم الوثيقة"
        size="sm"
      >
        <Field
          label="الاسم"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button onClick={handleSaveTitle} disabled={!title.trim()}>
          حفظ
        </Button>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          removeDocument(doc.id);
          setIsDeleteOpen(false);
        }}
        title="حذف الوثيقة"
        message="هتتحذف نهائيًا."
      />
    </>
  );
}
