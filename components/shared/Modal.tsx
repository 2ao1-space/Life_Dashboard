"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = { sm: "max-w-xs", md: "max-w-md", lg: "max-w-lg" }[size];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className={`w-full ${sizeClass} max-h-[85vh] overflow-y-auto rounded-card-lg bg-app-surface p-5 shadow-card`}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {title && (
          <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
            <h2 className="min-w-0 truncate text-base font-bold text-app-text">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="rounded-full p-1.5 text-app-text-2 hover:bg-app-surface-2"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
