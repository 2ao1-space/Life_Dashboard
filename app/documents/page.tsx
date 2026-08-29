"use client";

import { useDocuments } from "@/hooks/useDocuments";
import DocumentRow from "@/components/documents/documentRow";
import UploadButton from "@/components/documents/uploadButton";
import EmptyState from "@/components/shared/EmptyState";

export default function DocumentsPage() {
  const { documents } = useDocuments();

  return (
    <main className="mx-auto max-w-md space-y-5 px-4 pb-28 pt-5">
      <h1 className="text-lg font-extrabold text-app-text">الوثائق</h1>

      <div className="rounded-card-lg border border-app-border bg-app-surface px-4 shadow-card">
        {documents.length === 0 ? (
          <EmptyState icon="📁" title="مفيش وثائق لسه" />
        ) : (
          documents.map((doc) => <DocumentRow key={doc.id} doc={doc} />)
        )}
      </div>

      <UploadButton />
    </main>
  );
}
