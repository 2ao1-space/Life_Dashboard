"use client";

import { useState } from "react";
import EntityActions from "@/components/shared/EntityActions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Modal from "@/components/shared/Modal";
import Field from "@/components/shared/Field";
import Button from "@/components/shared/Button";
import { useDocuments } from "@/hooks/useDocuments";
import type { DocumentEntity } from "@/types/documents";
import AppIcon from "@/components/shared/AppIcon";

function iconFor(fileType: string | undefined | null) {
  if (!fileType) return "file";
  if (fileType.startsWith("image/")) return "file-image";
  if (fileType === "application/pdf") return "file-pdf";
  return "file";
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
          <AppIcon
            name={iconFor(doc.file_type)}
            size={20}
            className="text-app-primary"
          />
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
          onView={() => setIsViewOpen(true)}
          onEdit={() => setIsEditOpen(true)}
          onDelete={() => setIsDeleteOpen(true)}
          onShare={handleShare}
        />
      </div>

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={doc.title}
        size="lg"
      >
        {doc.file_type?.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.file_data}
            alt={doc.title}
            className="max-h-[68vh] w-full rounded-card-sm object-contain"
          />
        ) : doc.file_type === "application/pdf" ? (
          <div className="space-y-3">
            <object
              data={doc.file_data}
              type="application/pdf"
              aria-label={doc.title}
              className="h-[68vh] w-full rounded-card-sm border border-app-border"
            >
              <p className="text-center text-sm text-app-text-2">
                المعاينة غير متاحة في المتصفح
              </p>
            </object>
            <a
              href={doc.file_data}
              target="_blank"
              rel="noreferrer"
              className="block rounded-card-sm bg-app-primary-soft py-3 text-center text-sm font-bold text-app-primary-soft-text"
            >
              فتح الملف في تبويب جديد
            </a>
          </div>
        ) : (
          <a
            href={doc.file_data}
            download={doc.file_name}
            className="block rounded-card-sm bg-app-primary-soft py-3 text-center text-sm font-bold text-app-primary-soft-text"
          >
            تحميل الملف
          </a>
        )}
      </Modal>

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
