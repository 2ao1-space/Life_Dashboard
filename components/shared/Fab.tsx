"use client";

import { Plus } from "lucide-react";

interface FabProps {
  label: string;
  onClick: () => void;
}

export default function Fab({ label, onClick }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-app-primary px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(47,111,94,0.35)]"
    >
      <Plus size={18} />
      {label}
    </button>
  );
}
