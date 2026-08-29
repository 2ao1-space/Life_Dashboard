"use client";

import { useRef } from "react";
import { useDocuments } from "@/hooks/useDocuments";

export default function UploadButton() {
  const { addDocument } = useDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addDocument({
        title: file.name,
        file_name: file.name,
        file_type: file.type || "application/octet-stream",
        file_data: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="fixed bottom-24 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-app-primary px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(47,111,94,0.35)]"
      >
        📷 رفع وثيقة
      </button>
    </>
  );
}
