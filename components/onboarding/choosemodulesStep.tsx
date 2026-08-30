"use client";

import { useState } from "react";
import ModuleGrid from "@/components/settings/moduleGrid";
import type { ModuleKey } from "@/types/settings";

interface ChooseModulesStepProps {
  initialSelected: ModuleKey[];
  onFinish: (selected: ModuleKey[]) => void;
  onBack: () => void;
}

export default function ChooseModulesStep({
  initialSelected,
  onFinish,
  onBack,
}: ChooseModulesStepProps) {
  const [selected, setSelected] = useState<ModuleKey[]>(initialSelected);

  const toggle = (key: ModuleKey) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <div className="flex min-h-screen flex-col justify-between px-5 pb-8 pt-12">
      <div>
        <h1 className="mb-1 text-xl font-extrabold text-app-text">
          اختار صفحاتك
        </h1>
        <p className="mb-6 text-sm text-app-text-2">
          مش كل حد محتاج نفس الحاجات — اختار اللي هيفيدك بس. تقدر تغيّرها أو
          ترتّبها في أي وقت من الإعدادات.
        </p>

        <div className="rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
          <ModuleGrid selected={selected} onToggle={toggle} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-card-md border border-app-border py-3.5 text-sm font-bold text-app-text-2"
        >
          رجوع
        </button>
        <button
          type="button"
          onClick={() => onFinish(selected)}
          className="flex-[2] rounded-card-md bg-app-primary py-3.5 text-sm font-bold text-white"
        >
          ابدأ استخدام التطبيق
        </button>
      </div>
    </div>
  );
}
