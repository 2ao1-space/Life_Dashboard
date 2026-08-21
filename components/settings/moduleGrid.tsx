"use client";

import { MODULE_META, ALL_MODULE_KEYS } from "@/lib/constants/modules";
import type { ModuleKey } from "@/types/settings";

interface ModuleGridProps {
  selected: ModuleKey[];
  onToggle: (key: ModuleKey) => void;
}

const lockedBoxClass =
  "rounded-card-md border border-dashed border-app-border bg-app-surface-2 p-3.5 text-center opacity-60";

export default function ModuleGrid({ selected, onToggle }: ModuleGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <div className={lockedBoxClass}>
        <div className="mb-1.5 text-xl">🏠</div>
        <span className="text-[11.5px] font-semibold text-app-text-2">
          الداشبورد
        </span>
      </div>

      {ALL_MODULE_KEYS.map((key) => {
        const isSelected = selected.includes(key);
        const meta = MODULE_META[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            className={`relative rounded-card-md border p-3.5 text-center transition-colors ${
              isSelected
                ? "border-app-primary bg-app-primary-soft"
                : "border-dashed border-app-border"
            }`}
          >
            {isSelected && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-app-primary text-[9px] text-white">
                ✓
              </span>
            )}
            <div className="mb-1.5 text-xl">{meta.icon}</div>
            <span
              className={`text-[11.5px] font-semibold ${
                isSelected ? "text-app-primary-soft-text" : "text-app-text-2"
              }`}
            >
              {meta.label}
            </span>
          </button>
        );
      })}

      <div className={lockedBoxClass}>
        <div className="mb-1.5 text-xl">⚙️</div>
        <span className="text-[11.5px] font-semibold text-app-text-2">
          الإعدادات
        </span>
      </div>
    </div>
  );
}
